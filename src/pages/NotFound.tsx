import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSettingsContext } from "@/contexts/useSettingsContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useSettingsContext();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight tabular-nums text-foreground">404</h1>
        <p className="text-base text-muted-foreground">{t.notFoundTitle}</p>
        <Button asChild>
          <Link to="/">{t.returnHome}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
