import { Route, Routes } from "react-router-dom";
import { Button } from "@journeyhome/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@journeyhome/ui/components/card";

function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin console</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="accent">Get started</Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
