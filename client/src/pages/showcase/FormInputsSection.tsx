import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CalendarIcon, Check, Clock } from "lucide-react";

const frameworks = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "nextjs", label: "Next.js" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
];

export default function FormInputsSection() {
  const [datePickerDate, setDatePickerDate] = useState<Date>();
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);

  return (
    <section className="space-y-4">
      <h3 className="text-2xl font-semibold">Form Inputs</h3>
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Type your message here." />
          </div>
          <div className="space-y-2">
            <Label>Select</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <Label htmlFor="airplane-mode">Airplane Mode</Label>
          </div>
          <div className="space-y-2">
            <Label>Radio Group</Label>
            <RadioGroup defaultValue="option-one">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-one" id="option-one" />
                <Label htmlFor="option-one">Option One</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-two" id="option-two" />
                <Label htmlFor="option-two">Option Two</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Slider</Label>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
          <div className="space-y-2">
            <Label>Input OTP</Label>
            <InputOTP maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Date Time Picker */}
          <div className="space-y-2">
            <Label>Date Time Picker</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !datePickerDate && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {datePickerDate ? (
                    format(datePickerDate, "PPP HH:mm", { locale: zhCN })
                  ) : (
                    <span>Select date and time</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 space-y-3">
                  <Calendar
                    mode="single"
                    selected={datePickerDate}
                    onSelect={setDatePickerDate}
                  />
                  <div className="border-t pt-3 space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        value={datePickerDate ? format(datePickerDate, "HH:mm") : "00:00"}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = datePickerDate ? new Date(datePickerDate) : new Date();
                          newDate.setHours(parseInt(hours));
                          newDate.setMinutes(parseInt(minutes));
                          setDatePickerDate(newDate);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {datePickerDate && (
              <p className="text-sm text-muted-foreground">
                Selected: {format(datePickerDate, "yyyy/MM/dd  HH:mm", { locale: zhCN })}
              </p>
            )}
          </div>

          {/* Searchable Dropdown */}
          <div className="space-y-2">
            <Label>Searchable Dropdown</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                >
                  {selectedFramework
                    ? frameworks.find((fw) => fw.value === selectedFramework)?.label
                    : "Select framework..."}
                  <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search frameworks..." />
                  <CommandList>
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                      {frameworks.map((fw) => (
                        <CommandItem
                          key={fw.value}
                          value={fw.value}
                          onSelect={(currentValue) => {
                            setSelectedFramework(currentValue === selectedFramework ? "" : currentValue);
                            setOpenCombobox(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedFramework === fw.value ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {fw.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Month/Year Select */}
          <div className="space-y-2">
            <Label>Month/Year Select</Label>
            <div className="flex gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December",
                  ].map((month) => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => 2020 + i).map((year) => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Multi-Select Checkboxes */}
          <div className="space-y-2">
            <Label>Multi-Select (Checkboxes)</Label>
            <div className="flex flex-wrap gap-4">
              {["Apple", "Banana", "Cherry", "Date", "Elderberry"].map((fruit) => (
                <div key={fruit} className="flex items-center space-x-2">
                  <Checkbox
                    id={`fruit-${fruit}`}
                    checked={selectedFruits.includes(fruit)}
                    onCheckedChange={(checked) => {
                      setSelectedFruits(
                        checked
                          ? [...selectedFruits, fruit]
                          : selectedFruits.filter((f) => f !== fruit)
                      );
                    }}
                  />
                  <Label htmlFor={`fruit-${fruit}`}>{fruit}</Label>
                </div>
              ))}
            </div>
            {selectedFruits.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFruits.join(", ")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
