"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import $api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { isAxiosError } from "axios";

export default function DashboardPage({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const req = async () => {
            try {
                const data = await $api.post("https://uzfk.uz/uz/api/token/refresh/", {
                    refresh: localStorage.getItem("refresh")
                });

                localStorage.setItem("authToken", data.data.access);
            } catch (error) {
                if (isAxiosError(error)) {
                    localStorage.removeItem("isAuthenticated")
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("currentUser");
                    localStorage.removeItem("refresh");
                    toast({
                        title: "Not authorized",
                        description: error.message,
                        variant: "destructive",
                    })
                }
                router.push("/login");
            }
        }

        req();
    }, [])

    return <>{children}</>

}
