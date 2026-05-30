
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView

from ..models import BusinessListing
from .serializer import (
    BusinessListingCreateSerializer,
    BusinessListingGetSerializer,
    BusinessListingUpdateSerializer
)
from .services import BusinessListingService


class CreateBusinessListingView(APIView):
    """
    Create a new business listing
    POST /api/business/create/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = BusinessListingCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            listing = BusinessListingService.create_listing(
                validated_data=serializer.validated_data
            )
            
            return Response({
                'message': 'Business listing created successfully',
                'listing': BusinessListingCreateSerializer(listing).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetAllListingsView(ListAPIView):
    """
    GET /api/business/listings/
    Query params:
        search      – full-text search across title, service_detail, business_category
        category    – exact match on business_category
        sort_by     – field name, prefix with '-' for DESC (default: -created_at)
        lat         – user latitude  (float)
        lon         – user longitude (float)
        radius_km   – filter to listings within this many km (requires lat+lon)
        page        – page number (default 1)
        per_page    – results per page (default 10)
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = BusinessListingGetSerializer

    def get_queryset(self):
        params = self.request.query_params

        search    = params.get('search',   None)
        category  = params.get('category', None)
        sort_by   = params.get('sort_by',  '-created_at')
        page      = int(params.get('page',     1))
        per_page  = int(params.get('per_page', 10))

        # ── Geo params ────────────────────────────────────────────────────────
        try:
            user_lat = float(params['lat'])
            user_lon = float(params['lon'])
            has_geo  = True
        except (KeyError, ValueError, TypeError):
            user_lat = user_lon = None
            has_geo  = False

        try:
            radius_km = float(params['radius_km']) if has_geo else None
        except (ValueError, TypeError):
            radius_km = None

        result = BusinessListingService.get_listings(
            search=search,
            category=category,
            sort_by=sort_by,
            page=page,
            per_page=per_page,
            user_lat=user_lat,
            user_lon=user_lon,
            radius_km=radius_km,
        )

        self.pagination_data = {
            'total':        result['total'],
            'page':         result['page'],
            'per_page':     result['per_page'],
            'total_pages':  result['total_pages'],
            'has_next':     result['has_next'],
            'has_previous': result['has_previous'],
        }
        return result['listings']

    def list(self, request, *args, **kwargs):
        queryset   = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {'listings': serializer.data, 'pagination': self.pagination_data},
            status=status.HTTP_200_OK,
        )
    
    
class GetBusinessListingDetailView(RetrieveAPIView):
    """
    Get single business listing detail
    GET /api/business/<id>/
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = BusinessListingGetSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        return BusinessListing.objects.all()
    
    def retrieve(self, request, *args, **kwargs):
        listing_id = self.kwargs.get('id')
        
        # Use service to get listing
        listing = BusinessListingService.get_listing_detail(listing_id)
        
        if not listing:
            return Response({
                'error': 'Business listing not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = BusinessListingGetSerializer(listing)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateBusinessListingView(APIView):
    """
    Update business listing
    PUT /api/business/<id>/update/
    PATCH /api/business/<id>/update/
    """
    permission_classes = [permissions.AllowAny]
    
    def get_object(self, listing_id):
        try:
            return BusinessListing.objects.get(id=listing_id)
        except BusinessListing.DoesNotExist:
            return None
    
    def put(self, request, id):
        listing = self.get_object(id)
        
        if not listing:
            return Response({
                'error': 'Business listing not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = BusinessListingUpdateSerializer(
            listing, 
            data=request.data,
            partial=False
        )
        
        if serializer.is_valid():
            updated_listing = BusinessListingService.update_listing(
                listing, 
                serializer.validated_data
            )
            
            return Response({
                'message': 'Business listing updated successfully',
                'listing': BusinessListingUpdateSerializer(updated_listing).data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, id):
        """Partial update"""
        listing = self.get_object(id)
        
        if not listing:
            return Response({
                'error': 'Business listing not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = BusinessListingUpdateSerializer(
            listing, 
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            updated_listing = BusinessListingService.update_listing(
                listing, 
                serializer.validated_data
            )
            
            return Response({
                'message': 'Business listing updated successfully',
                'listing': BusinessListingUpdateSerializer(updated_listing).data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteBusinessListingView(APIView):
    """
    Delete business listing
    DELETE /api/business/<id>/delete/
    """
    permission_classes = [permissions.AllowAny]
    
    def delete(self, request, id):
        try:
            listing = BusinessListing.objects.get(id=id)
        except BusinessListing.DoesNotExist:
            return Response({
                'error': 'Business listing not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Delete the listing
        BusinessListingService.delete_listing(listing)
        
        return Response({
            'message': 'Business listing deleted successfully'
        }, status=status.HTTP_200_OK)