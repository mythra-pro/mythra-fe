"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center">
              <Search className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              404 - Page Not Found
            </CardTitle>
            <CardDescription className="text-gray-600">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-6">
                Don't worry, it happens to the best of us. Here are some helpful
                links:
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleGoBack}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>

              <Link href="/" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center">
                Need help? Contact our{" "}
                <Link
                  href="/support"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  support team
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
