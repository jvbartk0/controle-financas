import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCreditCardTransactions } from '@/hooks/useCreditCardTransactions';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  format: ExportFormat;
  dateFrom: string;
  dateTo: string;
  includeTransactions: boolean;
  includeCreditCardTransactions: boolean;
}

export const ExportData = () => {
  const { transactions } = useTransactions();
  const { transactions: creditCardTransactions } = useCreditCardTransactions();
  
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    dateFrom: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    dateTo: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    includeTransactions: true,
    includeCreditCardTransactions: true,
  });
  
  const [isExporting, setIsExporting] = useState(false);

  const filterByDate = <T extends { date?: string; purchase_date?: string }>(items: T[]): T[] => {
    return items.filter(item => {
      const date = item.date || item.purchase_date;
      if (!date) return false;
      return date >= options.dateFrom && date <= options.dateTo;
    });
  };

  const generateCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          const value = row[h];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  };

  const generateJSON = (data: Record<string, unknown>[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    setIsExporting(true);
    
    try {
      const dateRange = `${format(parseISO(options.dateFrom), 'dd-MM-yyyy')}_${format(parseISO(options.dateTo), 'dd-MM-yyyy')}`;
      
      if (options.includeTransactions) {
        const filteredTransactions = filterByDate(transactions).map(t => ({
          data: t.date,
          tipo: t.type === 'income' ? 'Receita' : 'Despesa',
          descricao: t.description || '',
          valor: t.amount,
        }));
        
        if (filteredTransactions.length > 0) {
          if (options.format === 'csv') {
            generateCSV(filteredTransactions, `transacoes_${dateRange}`);
          } else {
            generateJSON(filteredTransactions, `transacoes_${dateRange}`);
          }
        }
      }

      if (options.includeCreditCardTransactions) {
        const filteredCCTransactions = filterByDate(creditCardTransactions).map(t => ({
          data_compra: t.purchase_date,
          descricao: t.description,
          valor: t.amount,
          parcelamento: t.is_installment ? `${t.installment_number}/${t.total_installments}` : 'À vista',
        }));
        
        if (filteredCCTransactions.length > 0) {
          if (options.format === 'csv') {
            generateCSV(filteredCCTransactions, `cartoes_${dateRange}`);
          } else {
            generateJSON(filteredCCTransactions, `cartoes_${dateRange}`);
          }
        }
      }

      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar dados');
    } finally {
      setIsExporting(false);
    }
  };

  const setQuickPeriod = (months: number) => {
    const now = new Date();
    setOptions({
      ...options,
      dateFrom: format(startOfMonth(subMonths(now, months - 1)), 'yyyy-MM-dd'),
      dateTo: format(endOfMonth(now), 'yyyy-MM-dd'),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Formato</Label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={options.format === 'csv' ? 'default' : 'outline'}
              onClick={() => setOptions({ ...options, format: 'csv' })}
              className="gap-2 flex-1"
            >
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </Button>
            <Button
              type="button"
              variant={options.format === 'json' ? 'default' : 'outline'}
              onClick={() => setOptions({ ...options, format: 'json' })}
              className="gap-2 flex-1"
            >
              <FileText className="h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>

        {/* Period Selection */}
        <div className="space-y-2">
          <Label>Período</Label>
          <div className="flex gap-2 flex-wrap">
            <Button type="button" variant="outline" size="sm" onClick={() => setQuickPeriod(1)}>
              Este mês
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setQuickPeriod(3)}>
              3 meses
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setQuickPeriod(6)}>
              6 meses
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setQuickPeriod(12)}>
              12 meses
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">De</Label>
              <Input
                type="date"
                value={options.dateFrom}
                onChange={(e) => setOptions({ ...options, dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Até</Label>
              <Input
                type="date"
                value={options.dateTo}
                onChange={(e) => setOptions({ ...options, dateTo: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Data Selection */}
        <div className="space-y-3">
          <Label>Incluir</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="transactions"
                checked={options.includeTransactions}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, includeTransactions: checked as boolean })
                }
              />
              <label htmlFor="transactions" className="text-sm cursor-pointer">
                Transações ({filterByDate(transactions).length} registros)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="creditCards"
                checked={options.includeCreditCardTransactions}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, includeCreditCardTransactions: checked as boolean })
                }
              />
              <label htmlFor="creditCards" className="text-sm cursor-pointer">
                Compras em Cartões ({filterByDate(creditCardTransactions).length} registros)
              </label>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleExport} 
          className="w-full gap-2"
          disabled={isExporting || (!options.includeTransactions && !options.includeCreditCardTransactions)}
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </CardContent>
    </Card>
  );
};
