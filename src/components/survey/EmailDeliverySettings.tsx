
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Clock, SendHorizontal, Settings, Users, Check } from "lucide-react";
import { DeliveryConfig } from "@/domain/models/Survey";
import { useCustomers } from "@/application/hooks/useCustomers";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

interface EmailDeliverySettingsProps {
  deliveryConfig: DeliveryConfig;
  onConfigChange: (config: DeliveryConfig) => void;
}

export default function EmailDeliverySettings({ deliveryConfig, onConfigChange }: EmailDeliverySettingsProps) {
  const [config, setConfig] = useState<DeliveryConfig>(deliveryConfig);
  const [emailInput, setEmailInput] = useState<string>("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const { customerEmails, isLoading: isLoadingCustomers } = useCustomers();

  useEffect(() => {
    setConfig(deliveryConfig);
  }, [deliveryConfig]);

  const handleConfigChange = (newConfig: DeliveryConfig) => {
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleTypeChange = (value: 'manual' | 'scheduled' | 'triggered') => {
    const newConfig = { ...config, type: value };
    
    if (value === 'scheduled' && !newConfig.schedule) {
      newConfig.schedule = {
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '09:00',
      };
    } else if (value === 'triggered' && !newConfig.trigger) {
      newConfig.trigger = {
        type: 'ticket-closed',
        delayHours: 24,
        sendAutomatically: false,
      };
    }
    
    handleConfigChange(newConfig);
  };

  const addEmail = () => {
    if (!emailInput.trim() || !isValidEmail(emailInput)) return;
    
    const newEmails = [...config.emailAddresses];
    if (!newEmails.includes(emailInput)) {
      newEmails.push(emailInput);
      handleConfigChange({ ...config, emailAddresses: newEmails });
    }
    setEmailInput("");
  };

  const removeEmail = (email: string) => {
    const newEmails = config.emailAddresses.filter(e => e !== email);
    handleConfigChange({ ...config, emailAddresses: newEmails });
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addCustomerEmail = (email: string) => {
    if (!email || !isValidEmail(email)) return;
    
    const newEmails = [...config.emailAddresses];
    if (!newEmails.includes(email)) {
      newEmails.push(email);
      handleConfigChange({ ...config, emailAddresses: newEmails });
    }
    setPopoverOpen(false);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <SendHorizontal className="h-5 w-5 mr-2" />
          Email Delivery Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={config.type} onValueChange={(value) => handleTypeChange(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="triggered">Triggered</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Send this survey manually to specific email addresses.
            </p>
          </TabsContent>
          
          <TabsContent value="scheduled" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Schedule this survey to be sent automatically at regular intervals.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label>Frequency</Label>
                <Select 
                  value={config.schedule?.frequency || 'monthly'} 
                  onValueChange={(value) => handleConfigChange({
                    ...config,
                    schedule: {
                      ...config.schedule!,
                      frequency: value as 'daily' | 'weekly' | 'monthly'
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {config.schedule?.frequency === 'monthly' && (
                <div>
                  <Label>Day of Month</Label>
                  <Select 
                    value={String(config.schedule?.dayOfMonth || 1)} 
                    onValueChange={(value) => handleConfigChange({
                      ...config,
                      schedule: {
                        ...config.schedule!,
                        dayOfMonth: parseInt(value, 10)
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {config.schedule?.frequency === 'weekly' && (
                <div>
                  <Label>Day of Week</Label>
                  <Select 
                    value={String(config.schedule?.dayOfWeek || 1)} 
                    onValueChange={(value) => handleConfigChange({
                      ...config,
                      schedule: {
                        ...config.schedule!,
                        dayOfWeek: parseInt(value, 10)
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                      <SelectItem value="0">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label>Time</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={config.schedule?.time || "09:00"}
                    onChange={(e) => handleConfigChange({
                      ...config,
                      schedule: {
                        ...config.schedule!,
                        time: e.target.value
                      }
                    })}
                    className="w-32"
                  />
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="triggered" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Send this survey when specific events occur in your system.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label>Trigger Event</Label>
                <RadioGroup 
                  value={config.trigger?.type || "ticket-closed"}
                  onValueChange={(value) => handleConfigChange({
                    ...config,
                    trigger: {
                      ...config.trigger!,
                      type: value as 'ticket-closed' | 'purchase-completed'
                    }
                  })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ticket-closed" id="ticket-closed" />
                    <Label htmlFor="ticket-closed">After ticket is closed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="purchase-completed" id="purchase-completed" />
                    <Label htmlFor="purchase-completed">After purchase is completed</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label>Delay (hours)</Label>
                <Input
                  type="number"
                  min="0"
                  max="168"
                  value={config.trigger?.delayHours || 24}
                  onChange={(e) => handleConfigChange({
                    ...config,
                    trigger: {
                      ...config.trigger!,
                      delayHours: parseInt(e.target.value, 10) || 0
                    }
                  })}
                  className="w-24"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-send"
                  checked={config.trigger?.sendAutomatically || false}
                  onCheckedChange={(checked) => handleConfigChange({
                    ...config,
                    trigger: {
                      ...config.trigger!,
                      sendAutomatically: checked
                    }
                  })}
                />
                <Label htmlFor="auto-send">Send automatically</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <div className="space-y-4">
          <div>
            <Label>Email Recipients</Label>
            <div className="flex gap-2 mb-2">
              <div className="flex items-center space-x-2 mt-2 flex-1">
                <Input
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                />
                <Button onClick={addEmail} variant="outline" size="sm">Add</Button>
              </div>
              
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mt-2">
                    <Users className="mr-2 h-4 w-4" />
                    Customer Emails
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" side="bottom" align="start" alignOffset={0}>
                  <Command>
                    <CommandInput placeholder="Search customer emails..." />
                    <CommandEmpty>No customers found.</CommandEmpty>
                    <CommandGroup>
                      {isLoadingCustomers ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                        </div>
                      ) : (
                        customerEmails.map((email) => (
                          <CommandItem
                            key={email}
                            value={email}
                            onSelect={() => addCustomerEmail(email)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                config.emailAddresses.includes(email) ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {email}
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            {!isValidEmail(emailInput) && emailInput.trim() !== "" && (
              <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
            )}
          </div>
          
          <div className="space-y-2">
            {config.emailAddresses.length > 0 ? (
              <div className="border rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {config.emailAddresses.map((email, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="py-1.5 px-2.5 flex items-center"
                    >
                      <span>{email}</span>
                      <Button
                        onClick={() => removeEmail(email)}
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-1 rounded-full"
                      >
                        &times;
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No email addresses added yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
