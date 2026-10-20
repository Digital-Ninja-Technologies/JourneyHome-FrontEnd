import { Button } from "@journeyhome/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@journeyhome/ui/components/card";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
