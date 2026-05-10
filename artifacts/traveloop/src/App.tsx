import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

import { Landing } from "@/pages/landing";
import { Dashboard } from "@/pages/dashboard";
import { TripsPage } from "@/pages/trips";
import { CreateTripPage } from "@/pages/createTrip";
import { TripDetailPage } from "@/pages/tripDetail";
import { EditTripPage } from "@/pages/editTrip";
import { ItineraryPage } from "@/pages/itinerary";
import { BudgetPage } from "@/pages/budget";
import { PackingPage } from "@/pages/packing";
import { NotesPage } from "@/pages/notes";
import { CitiesPage } from "@/pages/cities";
import { ProfilePage } from "@/pages/profile";
import { PublicTripPage } from "@/pages/publicTrip";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
  },
  variables: {
    colorPrimary: "hsl(35 90% 55%)",
    colorForeground: "hsl(230 50% 10%)",
    colorMutedForeground: "hsl(230 20% 40%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(40 20% 95%)",
    colorInputForeground: "hsl(230 50% 10%)",
    colorNeutral: "hsl(40 20% 85%)",
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-serif font-bold text-primary",
    headerSubtitle: "text-muted-foreground",
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground transition-colors rounded-xl h-11",
    formFieldInput: "border-border focus:ring-primary focus:border-primary rounded-xl h-11 bg-card text-foreground",
    socialButtonsBlockButton: "border-border hover:bg-muted transition-colors rounded-xl",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
    main: "p-8",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080')] bg-cover bg-center" />
      <div className="z-10 w-full max-w-[440px]">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080')] bg-cover bg-center" />
      <div className="z-10 w-full max-w-[440px]">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><Redirect to="/dashboard" /></Show>
      <Show when="signed-out"><Landing /></Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Layout><Component /></Layout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />

          <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
          <Route path="/trips/new"><ProtectedRoute component={CreateTripPage} /></Route>
          <Route path="/trips/:tripId/edit"><ProtectedRoute component={EditTripPage} /></Route>
          <Route path="/trips/:tripId/itinerary"><ProtectedRoute component={ItineraryPage} /></Route>
          <Route path="/trips/:tripId/budget"><ProtectedRoute component={BudgetPage} /></Route>
          <Route path="/trips/:tripId/packing"><ProtectedRoute component={PackingPage} /></Route>
          <Route path="/trips/:tripId/notes"><ProtectedRoute component={NotesPage} /></Route>
          <Route path="/trips/:tripId"><ProtectedRoute component={TripDetailPage} /></Route>
          <Route path="/trips"><ProtectedRoute component={TripsPage} /></Route>
          <Route path="/cities"><ProtectedRoute component={CitiesPage} /></Route>
          <Route path="/profile"><ProtectedRoute component={ProfilePage} /></Route>

          <Route path="/public/:tripId" component={PublicTripPage} />

          <Route>
            <div className="flex h-screen items-center justify-center">
              <div className="text-center">
                <h1 className="font-serif text-4xl font-bold text-foreground mb-2">404</h1>
                <p className="text-muted-foreground">Page not found</p>
              </div>
            </div>
          </Route>
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
