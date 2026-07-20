import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    window.location.href = getLoginUrl();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-[380px]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to GovCheat</CardTitle>
          <CardDescription>Sign in to access your contracts dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogin} className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Sign In with Manus
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
