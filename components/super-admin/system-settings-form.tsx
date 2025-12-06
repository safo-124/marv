"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  overdueThresholdDefault: z.number().min(1).max(100),
  escalationDelayDays: z.number().min(1).max(30),
  completionDropThreshold: z.number().min(1).max(100),
  inactivityDays: z.number().min(1).max(365),
  criticalThreshold: z.number().min(1).max(100),
  emailAlertsEnabled: z.boolean(),
  pushAlertsEnabled: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface SystemSettingsFormProps {
  settings?: {
    overdueThresholdDefault: number
    escalationDelayDays: number
    completionDropThreshold: number
    inactivityDays: number
    criticalThreshold: number
    emailAlertsEnabled: boolean
    pushAlertsEnabled: boolean
  }
}

export function SystemSettingsForm({ settings }: SystemSettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      overdueThresholdDefault: settings?.overdueThresholdDefault ?? 20,
      escalationDelayDays: settings?.escalationDelayDays ?? 3,
      completionDropThreshold: settings?.completionDropThreshold ?? 10,
      inactivityDays: settings?.inactivityDays ?? 30,
      criticalThreshold: settings?.criticalThreshold ?? 40,
      emailAlertsEnabled: settings?.emailAlertsEnabled ?? true,
      pushAlertsEnabled: settings?.pushAlertsEnabled ?? true,
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/super-admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast.success("Settings saved successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="overdueThresholdDefault"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Overdue Threshold (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={100} 
                    className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription className="text-slate-500 dark:text-slate-400">
                  Default percentage threshold for overdue alerts
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="escalationDelayDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Escalation Delay (Days)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={30}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription className="text-slate-500 dark:text-slate-400">
                  Days before unresolved alerts are escalated
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="completionDropThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Completion Drop Threshold (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={100}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription className="text-slate-500 dark:text-slate-400">
                  Alert when completion rate drops by this percentage
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inactivityDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Inactivity Days</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={365}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription className="text-slate-500 dark:text-slate-400">
                  Alert when a hospital has no activity for this many days
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="criticalThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Critical Threshold (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={100}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription className="text-slate-500 dark:text-slate-400">
                  Threshold for critical severity alerts
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="emailAlertsEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base text-slate-900 dark:text-white font-medium">Email Alerts</FormLabel>
                  <FormDescription className="text-slate-500 dark:text-slate-400">
                    Receive alert notifications via email
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pushAlertsEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base text-slate-900 dark:text-white font-medium">Push Notifications</FormLabel>
                  <FormDescription className="text-slate-500 dark:text-slate-400">
                    Receive alert notifications via push
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  )
}
