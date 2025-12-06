"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Uganda Districts organized by region
const ugandaDistricts = [
  // Central Region
  "Kampala", "Wakiso", "Mukono", "Buikwe", "Buvuma", "Kayunga", "Luwero", "Nakaseke",
  "Nakasongola", "Mityana", "Mubende", "Kiboga", "Kyankwanzi", "Kassanda", "Gomba",
  "Butambala", "Mpigi", "Masaka", "Kalungu", "Lwengo", "Lyantonde", "Rakai", "Kyotera",
  "Sembabule", "Kalangala",
  // Eastern Region  
  "Jinja", "Iganga", "Mayuge", "Bugiri", "Namayingo", "Busia", "Tororo", "Butaleja",
  "Budaka", "Kibuku", "Pallisa", "Butebo", "Mbale", "Manafwa", "Bududa", "Namisindwa",
  "Sironko", "Bulambuli", "Kapchorwa", "Kween", "Bukwo", "Soroti", "Serere", "Ngora",
  "Kumi", "Bukedea", "Kaberamaido", "Amuria", "Katakwi", "Kapelebyong",
  // Northern Region
  "Gulu", "Omoro", "Nwoya", "Amuru", "Pader", "Agago", "Kitgum", "Lamwo", "Lira",
  "Alebtong", "Otuke", "Kole", "Apac", "Kwania", "Dokolo", "Oyam", "Arua", "Maracha",
  "Koboko", "Yumbe", "Moyo", "Obongi", "Adjumani", "Nebbi", "Pakwach", "Zombo",
  // Western Region
  "Mbarara", "Isingiro", "Kiruhura", "Ibanda", "Kamwenge", "Kabarole", "Kyenjojo",
  "Kyegegwa", "Ntoroko", "Bundibugyo", "Kasese", "Rubirizi", "Bushenyi", "Sheema",
  "Mitooma", "Buhweju", "Rukungiri", "Kanungu", "Rukiga", "Rubanda", "Kisoro", "Kabale",
  "Ntungamo", "Hoima", "Kikuube", "Kagadi", "Kibaale", "Kakumiro", "Masindi", "Kiryandongo", "Buliisa"
].sort()

const createHospitalSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(30, "Slug must be at most 30 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  code: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
})

type CreateHospitalForm = z.infer<typeof createHospitalSchema>

export function CreateHospitalDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateHospitalForm>({
    resolver: zodResolver(createHospitalSchema),
    defaultValues: {
      name: "",
      slug: "",
      code: "",
      address: "",
      city: "",
      state: "",
      phone: "",
      email: "",
    },
  })

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 30)
    form.setValue("slug", slug)
  }

  const onSubmit = async (data: CreateHospitalForm) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/super-admin/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create hospital")
      }

      toast.success("Hospital created successfully")
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create hospital")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Hospital
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white text-xl">Create New Hospital</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Add a new hospital to the system. The hospital will be created with pending status.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Hospital Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Mulago National Referral Hospital"
                        className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400"
                        onChange={(e) => {
                          field.onChange(e)
                          handleNameChange(e.target.value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Subdomain Slug *</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input {...field} placeholder="mulago-hospital" className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400" />
                        <span className="ml-2 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">
                          .marv.ug
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription className="text-slate-500 dark:text-slate-400">
                      This will be the hospital&apos;s unique subdomain
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Hospital Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="MUL001" className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400" />
                    </FormControl>
                    <FormDescription className="text-slate-500 dark:text-slate-400">Optional registration code</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+256 700 000 000" className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="contact@hospital.go.ug" className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Plot 1-3 Mulago Hill Road" className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[80px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">City/Town</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Kampala" className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">District</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-[300px]">
                        {ugandaDistricts.map((district) => (
                          <SelectItem key={district} value={district} className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-700">
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Hospital"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
