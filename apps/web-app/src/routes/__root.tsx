import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeInit } from "../../.flowbite-react/init";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <ThemeInit />
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
