"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useToast } from "@/hooks/use-toast"
import { IAuthResponse } from "@/types/auth.types"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Check if already authenticated
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("isAuthenticated") === "true") {
      router.push("/dashboard/users");
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      if (username.trim() === "") {
        return toast(
          {
            title: "Login failed",
            description: "User name cannot be empty",
            variant: "destructive"
          }
        )
      }
      if (password.trim() === "") {
        return toast(
          {
            title: "Login failed",
            description: "Password cannot be empty",
            variant: "destructive"
          }
        );
      }

      const res = await fetch("https://uzfk.uz/uz/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        setError("Invalid username or password. Please use admin/password.")
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        })
        throw new Error("Someting went worng...");
      }

      const result: IAuthResponse = await res.json();

      localStorage.setItem("isAuthenticated", result.access);
      localStorage.setItem("authToken", result.access);
      localStorage.setItem("refresh", result.refresh);
      localStorage.setItem("currentUser", username);
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      })
      router.push("/dashboard/users");
    } catch (error) {
      toast({
        title: "Login failed",
        description: ""
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-500">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
