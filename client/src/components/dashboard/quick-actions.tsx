import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Clock, Calendar } from "lucide-react";
import AddPropertyModal from "@/components/properties/add-property-modal";
import AddExpenseModal from "@/components/modals/add-expense-modal";
import TimeEntryModal from "@/components/modals/time-entry-modal";
import ScheduleShowingModal from "@/components/modals/schedule-showing-modal";

export default function QuickActions() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const actions = [
    {
      icon: Plus,
      label: "Add Property",
      action: () => setActiveModal("property")
    },
    {
      icon: Receipt,
      label: "Log Expense",
      action: () => setActiveModal("expense")
    },
    {
      icon: Clock,
      label: "Log Time",
      action: () => setActiveModal("time")
    },
    {
      icon: Calendar,
      label: "Schedule Showing",
      action: () => setActiveModal("showing")
    }
  ];

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                onClick={action.action}
              >
                <action.icon className="h-4 w-4 mr-2 text-primary" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <AddPropertyModal 
        isOpen={activeModal === "property"} 
        onClose={() => setActiveModal(null)} 
      />
      <AddExpenseModal 
        isOpen={activeModal === "expense"} 
        onClose={() => setActiveModal(null)} 
      />
      <TimeEntryModal 
        isOpen={activeModal === "time"} 
        onClose={() => setActiveModal(null)} 
      />
      <ScheduleShowingModal 
        isOpen={activeModal === "showing"} 
        onClose={() => setActiveModal(null)} 
      />
    </>
  );
}
