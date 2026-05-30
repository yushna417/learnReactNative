from django.db.models import Q 
from django.core.paginator import Paginator
from geopy.geocoders import Nominatim
from ..models import BusinessListing


import math
from django.db.models import FloatField, ExpressionWrapper, F
from django.db.models.functions import Sin, Cos, ACos, Radians

class BusinessListingService:

    @staticmethod
    def get_listings(
        search=None,
        category=None,
        sort_by='-created_at',
        page=1,
        per_page=10,
        user_lat=None,
        user_lon=None,
        radius_km=None,
    ):
        qs = BusinessListing.objects.all()

        # ── 1. Full-text search (title + service_detail + category) ───────────
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(service_detail__icontains=search) |
                Q(business_category__icontains=search)
            )

        if category and category != 'All':
            qs = qs.filter(business_category=category)

        if user_lat is not None and user_lon is not None and radius_km:
            qs = qs.exclude(latitude=None).exclude(longitude=None)

            lat1_rad  = math.radians(user_lat)
            lon1_rad  = math.radians(user_lon)  # noqa: F841 (used in expression string)

            distance_expr = ExpressionWrapper(
                6371.0 * ACos(
                    Sin(Radians(user_lat)) * Sin(Radians(F('latitude')))
                    + Cos(Radians(user_lat)) * Cos(Radians(F('latitude')))
                    * Cos(Radians(F('longitude') - user_lon))
                ),
                output_field=FloatField(),
            )

            qs = (
                qs
                .annotate(distance_km=distance_expr)
                .filter(distance_km__lte=radius_km)
                .order_by('distance_km')   # closest first when radius active
            )
        else:
            allowed_sorts = {
                'newest':    '-created_at',
                '-created_at': '-created_at',
                'oldest':    'created_at',
                'created_at': 'created_at',
                'title':     'title',
                '-title':    '-title',
            }
            qs = qs.order_by(allowed_sorts.get(sort_by, '-created_at'))

        total      = qs.count()
        offset     = (page - 1) * per_page
        listings   = qs[offset: offset + per_page]
        total_pages = math.ceil(total / per_page) if per_page else 1

        return {
            'listings':     listings,
            'total':        total,
            'page':         page,
            'per_page':     per_page,
            'total_pages':  total_pages,
            'has_next':     page < total_pages,
            'has_previous': page > 1,
        }
    
    @staticmethod
    def reverse_geocode(latitude, longitude):
        """
        Get address from latitude and longitude using Nominatim
        Returns address string or None if geocoding fails
        """
        if not latitude or not longitude:
            return None
        
        try:
            geolocator = Nominatim(user_agent="business_listing_app")            
            location = geolocator.reverse(f"{latitude}, {longitude}")            
            return location.address # type: ignore
        except Exception as e:
            print(f"Geocoding error: {e}")
        
        return None
    
    @staticmethod
    def get_listing_detail(listing_id):
        """
        Get single listing detail
        """
        try:
            listing = BusinessListing.objects.get(id=listing_id)
            return listing
        except BusinessListing.DoesNotExist:
            return None
    
    @staticmethod
    def create_listing(validated_data):
        """
        Create new business listing with automatic address geocoding
        """
        if not validated_data.get('address') and validated_data.get('latitude') and validated_data.get('longitude'):
            address = BusinessListingService.reverse_geocode(
                validated_data['latitude'], 
                validated_data['longitude']
            )
            if address:
                validated_data['address'] = address
        
        listing = BusinessListing.objects.create(**validated_data)
        return listing
    
    @staticmethod
    def update_listing(listing, validated_data):
        """
        Update existing business listing with automatic address geocoding
        """
        update_lat = validated_data.get('latitude', listing.latitude)
        update_lng = validated_data.get('longitude', listing.longitude)
        address_provided = validated_data.get('address')
        
        if not address_provided and update_lat and update_lng:
            address = BusinessListingService.reverse_geocode(update_lat, update_lng)
            if address:
                validated_data['address'] = address
        
        for key, value in validated_data.items():
            setattr(listing, key, value)
        listing.save()
        return listing
    
    @staticmethod
    def delete_listing(listing):
        """
        Hard delete business listing
        """
        listing.delete()