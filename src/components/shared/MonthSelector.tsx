import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export const MonthSelector = ({ month, year, onChange }: MonthSelectorProps) => {
  const currentDate = new Date(year, month - 1);

  const handlePrevMonth = () => {
    const prev = subMonths(currentDate, 1);
    onChange(prev.getMonth() + 1, prev.getFullYear());
  };

  const handleNextMonth = () => {
    const next = new Date(year, month);
    onChange(next.getMonth() + 1, next.getFullYear());
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    onChange(now.getMonth() + 1, now.getFullYear());
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handlePrevMonth}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button variant="outline" onClick={handleCurrentMonth} className="min-w-[140px]">
        <Calendar className="w-4 h-4 mr-2" />
        {format(currentDate, "MMMM yyyy", { locale: ptBR })}
      </Button>
      <Button variant="outline" size="icon" onClick={handleNextMonth}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
