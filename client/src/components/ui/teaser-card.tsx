import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import * as Icons from "lucide-react";

interface TeaserCardProps {
  title: string;
  description: string;
  iconName: keyof typeof Icons;
  actionLabel?: string;
}

export function TeaserCard({ title, description, iconName, actionLabel = "Notify me" }: TeaserCardProps) {
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const IconComponent = Icons[iconName] as any;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-default border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {IconComponent && (
                <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
                  <IconComponent className="h-5 w-5" />
                </div>
              )}
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">
                {title}
              </h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {description}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2 ml-4">
            <Switch 
              checked={notifyEnabled}
              onCheckedChange={setNotifyEnabled}
              data-testid={`switch-notify-${title.toLowerCase().replace(/\s+/g, '-')}`}
            />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {actionLabel}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}