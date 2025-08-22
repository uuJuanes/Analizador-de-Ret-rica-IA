import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisResult } from '../types';
import ResultsChart from './ResultsChart';
import FeedbackSection from './FeedbackSection';
import ExercisesSection from './ExercisesSection';
import HighlightsSection from './HighlightsSection';
import ImprovedTextSection from './ImprovedTextSection';
import PdfReport from './PdfReport';
import ComparisonSection from './ComparisonSection';
import ToneAnalysisSection from './ToneAnalysisSection';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ShareIcon } from './icons/ShareIcon';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; ariaLabel: string }> = ({ onClick, children, ariaLabel }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-primary bg-brand-light dark:bg-indigo-500/20 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-colors"
    aria-label={ariaLabel}
  >
    {children}
  </button>
);


const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [scriptCopied, setScriptCopied] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);

  const handleDownloadPdf = async () => {
    const input = pdfRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#ffffff',
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`analisis-persuasion-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleCopyToClipboard = (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyScript = () => {
    if (!result.improvedText) return;
    handleCopyToClipboard(result.improvedText, setScriptCopied);
  };
  
  const handleShareSummary = () => {
    const summary = `📊 Resumen de Análisis de Ventas:
- Título: ${result.title}
- Pre-suasión: ${result.scores.presuasion}/100
- Ethos: ${result.scores.ethos}/100
- Pathos: ${result.scores.pathos}/100
- Logos: ${result.scores.logos}/100
- Mejora Clave: ${result.comparisonAnalysis?.keyImprovement || 'N/A'}`;
    handleCopyToClipboard(summary, setSummaryCopied);
  };

  return (
    <div className="space-y-8 animate-fade-in-up" style={{ animationFillMode: 'backwards' }}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Panel de Análisis</h2>
            {result.tokenUsage && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Tokens Usados: {result.tokenUsage.totalTokens.toLocaleString('es-ES')}
                </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
              {result.improvedText && (
                <ActionButton onClick={handleCopyScript} ariaLabel="Copiar guion mejorado">
                    {scriptCopied ? <><CheckIcon className="h-4 w-4 text-green-500" /> ¡Copiado!</> : <><CopyIcon className="h-4 w-4" /> Copiar Guion</>}
                </ActionButton>
              )}
              <ActionButton onClick={handleShareSummary} ariaLabel="Compartir resumen">
                  {summaryCopied ? <><CheckIcon className="h-4 w-4 text-green-500" /> ¡Copiado!</> : <><ShareIcon className="h-4 w-4" /> Compartir Resumen</>}
              </ActionButton>
              <ActionButton onClick={handleDownloadPdf} ariaLabel="Descargar resultados en PDF">
                <DownloadIcon className="h-4 w-4" /> PDF
              </ActionButton>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Puntuación de Persuasión</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Un desglose visual de tu guion actual comparado con intentos anteriores.</p>
            <ResultsChart 
              scores={result.scores} 
              comparisonScores={result.comparisonAnalysis?.averagePreviousScores}
            />
          </div>
          <div>
            <HighlightsSection highlights={result.highlights} />
          </div>
        </div>
      </div>
      
      {result.comparisonAnalysis && <ComparisonSection comparison={result.comparisonAnalysis} currentScores={result.scores} />}

      {result.toneAnalysis && <ToneAnalysisSection analysis={result.toneAnalysis} />}

      {result.improvedText && <ImprovedTextSection text={result.improvedText} />}
      {result.feedback && <FeedbackSection feedback={result.feedback} />}
      {result.exercises && <ExercisesSection exercises={result.exercises} />}
      
      {/* Off-screen component for PDF generation, positioned absolutely */}
      <div className="absolute left-[-9999px] top-0">
        <PdfReport ref={pdfRef} result={result} />
      </div>
    </div>
  );
};

export default AnalysisResults;