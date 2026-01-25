'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportCard {
  type: string;
  category: string;
  difficulty: string;
  content: string;
}

interface ImportResult {
  success: number;
  errors: number;
  duplicates: number;
  messages: string[];
}

export default function ImportarCartasPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<ImportCard[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setPreview([]);

    // Preview first 5 rows
    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        alert('Arquivo vazio ou inválido');
        return;
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const previewData: ImportCard[] = [];

      for (let i = 1; i < Math.min(6, lines.length); i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 4) {
          previewData.push({
            type: values[0]?.trim() || '',
            category: values[1]?.trim() || '',
            difficulty: values[2]?.trim() || '',
            content: values[3]?.trim() || '',
          });
        }
      }

      setPreview(previewData);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Erro ao ler arquivo');
    }
  };

  // Simple CSV parser that handles quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result.map(s => s.replace(/^"|"$/g, ''));
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        alert('Arquivo não contém dados');
        return;
      }

      // Parse all cards
      const cards: ImportCard[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 4 && values[3]?.trim()) {
          cards.push({
            type: values[0]?.trim() || '',
            category: values[1]?.trim() || '',
            difficulty: values[2]?.trim() || '',
            content: values[3]?.trim() || '',
          });
        }
      }

      if (cards.length === 0) {
        alert('Nenhuma carta válida encontrada no arquivo');
        return;
      }

      // Send to API
      const response = await fetch('/api/admin/import-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao importar cartas');
      }

      setResult(data.result);
    } catch (error: any) {
      console.error('Import error:', error);
      alert(error.message || 'Erro ao importar cartas');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = `type,category,difficulty,content
pergunta,casais,facil,"Qual foi o seu primeiro beijo?"
tarefa,casais,medio,"Dê um beijo de 10 segundos no seu parceiro"
pergunta,trios,dificil,"Qual é a sua maior fantasia sexual?"
tarefa,grupos,extremo,"Tire uma peça de roupa"`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_cartas.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Importar Cartas
        </h1>
        <p className="text-gray-400">
          Faça upload de uma planilha CSV ou Excel para importar cartas em massa
        </p>
      </div>

      {/* Template Download */}
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            Template da Planilha
          </CardTitle>
          <CardDescription className="text-gray-400">
            Baixe o template e preencha com suas cartas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Template CSV
          </Button>
        </CardContent>
      </Card>

      {/* Upload */}
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload do Arquivo
          </CardTitle>
          <CardDescription className="text-gray-400">
            Selecione um arquivo CSV (.csv) com as cartas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-zinc-700 rounded-md text-sm font-medium text-gray-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Escolher Arquivo
            </label>
            {file && (
              <span className="text-gray-400 text-sm">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </span>
            )}
          </div>

          {file && preview.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-2">Preview (primeiras 5 linhas):</h3>
              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                {preview.map((card, i) => (
                  <div key={i} className="text-sm">
                    <span className="text-red-400">{card.type}</span>
                    {' / '}
                    <span className="text-blue-400">{card.category}</span>
                    {' / '}
                    <span className="text-yellow-400">{card.difficulty}</span>
                    {' / '}
                    <span className="text-gray-300">{card.content.substring(0, 50)}...</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {file && (
            <Button
              onClick={handleImport}
              disabled={isProcessing}
              className="bg-red-700 hover:bg-red-800"
            >
              {isProcessing ? 'Importando...' : 'Importar Cartas'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {result.errors > 0 ? (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              Resultado da Importação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{result.success}</div>
                <div className="text-sm text-gray-400">Importadas</div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">{result.duplicates}</div>
                <div className="text-sm text-gray-400">Duplicadas</div>
              </div>
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-400">{result.errors}</div>
                <div className="text-sm text-gray-400">Erros</div>
              </div>
            </div>

            {result.messages.length > 0 && (
              <Alert className="bg-zinc-800 border-zinc-700">
                <AlertDescription className="text-gray-300">
                  <div className="max-h-96 overflow-y-auto pr-2">
                    <ul className="list-disc list-inside space-y-1">
                      {result.messages.map((msg, i) => (
                        <li key={i} className="text-sm">{msg}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-zinc-700">
                    Total de mensagens: {result.messages.length}
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Instruções</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-400 space-y-2 text-sm">
          <p><strong className="text-white">1.</strong> Baixe o template CSV</p>
          <p><strong className="text-white">2.</strong> Preencha com suas cartas seguindo o formato:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>type:</strong> pergunta ou tarefa</li>
            <li><strong>category:</strong> casais, trios ou grupos</li>
            <li><strong>difficulty:</strong> facil, medio, dificil ou extremo</li>
            <li><strong>content:</strong> texto da pergunta/tarefa</li>
          </ul>
          <p><strong className="text-white">3.</strong> Salve como CSV (separado por vírgula)</p>
          <p><strong className="text-white">4.</strong> Faça upload do arquivo</p>
          <p><strong className="text-white">5.</strong> Confira o preview e clique em &quot;Importar Cartas&quot;</p>
        </CardContent>
      </Card>
    </div>
  );
}
