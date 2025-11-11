import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// --- Helper Icon Components (defined outside App to prevent re-creation) ---

const EnvelopeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );

// Limite pour la génération "TOUT"
const MAX_USERNAME_LENGTH = 16;

// --- Main App Component ---

export default function App() {
    const [email, setEmail] = useState('');
    const [generatedEmails, setGeneratedEmails] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    
    // NOUVEL ÉTAT POUR LA QUANTITÉ
    const [quantity, setQuantity] = useState<string>('10'); 
    
    const downloadMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
                setIsDownloadMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const isValidEmail = useMemo(() => {
        if (!email) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }, [email]);

    // --- FONCTION 1 : GÉNÉRER TOUT (LOGIQUE ORIGINALE) ---
    const handleGenerate = useCallback(() => {
        setError(null);
        setGeneratedEmails([]);
        if (!isValidEmail) {
            setError("الرجاء إدخال بريد إلكتروني صالح. (Please enter a valid email address.)");
            return;
        }

        setIsLoading(true);
        // Use setTimeout to allow UI to update before blocking with generation
        setTimeout(() => {
            try {
                const [usernameWithDots, domain] = email.split('@');
                const username = usernameWithDots.replace(/\./g, '');

                if (username.length > MAX_USERNAME_LENGTH) {
                    throw new Error(`Username is too long (>${MAX_USERNAME_LENGTH} chars). Generation might crash the browser.`);
                }
                
                if(username.length < 2) {
                     throw new Error(`Username is too short to generate variations.`);
                }

                const variations = new Set<string>();
                const n = username.length;
                const insertionPoints = n - 1;
                const permutationsCount = 1 << insertionPoints;

                for (let i = 0; i < permutationsCount; i++) {
                    let newUsername = username[0];
                    for (let j = 0; j < insertionPoints; j++) {
                        if ((i >> j) & 1) {
                            newUsername += '.';
                        }
                        newUsername += username[j + 1];
                    }
                    variations.add(`${newUsername}@${domain}`);
                }

                variations.add(email); // Add original
                variations.add(`${username}@${domain}`); // Add dot-less version

                setGeneratedEmails(Array.from(variations).sort());
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        }, 50);

    }, [email, isValidEmail]);

    // --- FONCTION 2 : GÉNÉRER ALÉATOIREMENT (NOUVELLE LOGIQUE) ---
    const handleGenerateRandom = useCallback(() => {
        setError(null);
        setGeneratedEmails([]);
        if (!isValidEmail) {
            setError("Please enter a valid email address");
            return;
        }

        const numToGenerate = Number(quantity);
        if (numToGenerate <= 0) {
            setError("La quantité doit être supérieure à 0.");
            return;
        }

        setIsLoading(true);
        // Use setTimeout pour laisser l'UI se mettre à jour
        setTimeout(() => {
            try {
                const [usernameWithDots, domain] = email.split('@');
                const username = usernameWithDots.replace(/\./g, '');
                const n = username.length;

                if (n < 2) {
                     throw new Error(`Username is too short to generate variations.`);
                }
                
                // --- Logique de génération aléatoire ---
                const variations = new Set<string>();
                variations.add(email); // Ajouter l'original
                variations.add(`${username}@${domain}`); // Ajouter la version sans points

                // Calculer le max possible pour ne pas boucler à l'infini
                const insertionPoints = n - 1;
                // (Attention: 1 << 30 déborde en JS. Limiter à 30 insertion points)
                const maxPossible = (insertionPoints > 30) ? 
                                    Infinity : 
                                    (1 << insertionPoints);

                const finalAmountToGenerate = Math.min(numToGenerate, maxPossible + 2); // +2 pour l'original et le sans-point

                if (numToGenerate > maxPossible + 2) {
                    setError(`Le nom d'utilisateur est trop court, ${maxPossible + 2} variations max. Génération en cours...`);
                }

                // Boucle TANT QUE nous n'avons pas assez d'e-mails
                while (variations.size < finalAmountToGenerate) {
                    let newUsername = username[0];
                    for (let j = 0; j < insertionPoints; j++) {
                        // Décision aléatoire (50% de chance) d'ajouter un point
                        if (Math.random() > 0.5) {
                            newUsername += '.';
                        }
                        newUsername += username[j + 1];
                    }
                    variations.add(`${newUsername}@${domain}`);
                }
                // --- Fin de la logique ---

                setGeneratedEmails(Array.from(variations).sort());
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        }, 50);

    }, [email, isValidEmail, quantity]); // <-- DÉPENDANCE "quantity" AJOUTÉE


    const handleCopy = useCallback((text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    }, []);

    const handleCopyAll = useCallback(() => {
        if (generatedEmails.length === 0) return;
        navigator.clipboard.writeText(generatedEmails.join('\n'));
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    }, [generatedEmails]);

    const handleDownload = useCallback((format: 'txt' | 'html') => {
        if (generatedEmails.length === 0) return;
        
        let content = '';
        let mimeType = '';
        let filename = '';
    
        if (format === 'txt') {
            content = generatedEmails.join('\n');
            mimeType = 'text/plain;charset=utf-8;';
            filename = 'gmail-aliases.txt';
        } else { // html
            const emailListItems = generatedEmails.map(e => `      <li><pre>${e}</pre></li>`).join('\n');
            content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Gmail Aliases</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f9; color: #333; line-height: 1.6; padding: 20px; }
        .container { max-width: 800px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #444; }
        ul { list-style-type: none; padding: 0; }
        li { background: #eee; margin-bottom: 5px; padding: 10px; border-radius: 4px; }
        pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; font-family: "Menlo", "Consolas", monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Generated Gmail Aliases (${generatedEmails.length})</h1>
        <ul>
${emailListItems}
        </ul>
    </div>
</body>
</html>`;
            mimeType = 'text/html;charset=utf-8;';
            filename = 'gmail-aliases.html';
        }
    
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsDownloadMenuOpen(false);
    
    }, [generatedEmails]);
    
    const handleClear = useCallback(() => {
        setEmail('');
        setGeneratedEmails([]);
        setError(null);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4 font-sans">
            <main className="w-full max-w-2xl mx-auto">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl shadow-blue-500/10 p-6 md:p-8 space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                           Gmail Dot Trick Email Generator
                        </h1>
                    </div>

                    <div className="space-y-4">
                        <label htmlFor="email-input" className="block text-sm font-medium text-gray-400">
                          Primary Email
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-grow">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                                </span>
                                <input
                                    type="email"
                                    id="email-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@gmail.com"
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                            {/* BLOC POUR LA QUANTITÉ */}
                            <div className="relative">
                                <input
                                    type="number"
                                    id="quantity-input"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    min="1"
                                    className="w-full sm:w-24 bg-gray-900/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                                <label htmlFor="quantity-input" className="absolute -top-2 left-3 bg-gray-800/50 backdrop-blur-sm px-1 text-xs text-gray-400">Quantité</label>
                            </div>
                        </div>

                        {/* Les boutons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Bouton original (Générer tout) */}
                            <button
                                onClick={handleGenerate}
                                disabled={!isValidEmail || isLoading}
                                // CLASSES CSS RESTAURÉES
                                className="flex-grow flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        Generate All
                                    </>
                                )}
                            </button>

                            {/* NOUVEAU BOUTON (Générer N Aléatoirement) */}
                            <button
                                onClick={handleGenerateRandom} // Appelle la NOUVELLE fonction
                                disabled={!isValidEmail || isLoading || Number(quantity) <= 0}
                                className="flex-grow flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? (
                                    <> 
                                        {/* SPINNER CORRIGÉ */}
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-4.992-3.182-3.182a8.25 8.25 0 0 0-11.667 0L2.985 14.652m9.007-9.007H10.5" />
                                        </svg>
                                        Générer {Number(quantity) > 0 ? quantity : ''} Aléatoirement
                                    </>
                                )}
                            </button>
                        </div>
                        {/* Fin des boutons */}

                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </div>

                    {generatedEmails.length > 0 && (
                        <div className="pt-4 space-y-4 animate-fade-in">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-300">
                                    {generatedEmails.length} <span className="text-gray-400">Generated Emails</span>
                                </h2>
                                <div className="flex gap-2">
                                     <button
                                        onClick={handleCopyAll}
                                        className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-3 rounded-md transition-colors flex items-center gap-2"
                                    >
                                        {copiedAll ? <><CheckIcon className="text-green-400"/> Copied ✅</> : <><CopyIcon /> Copy All</>}
                                    </button>
                                    
                                    <div className="relative" ref={downloadMenuRef}>
                                        <button
                                            onClick={() => setIsDownloadMenuOpen(prev => !prev)}
                                            className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-3 rounded-md transition-colors flex items-center gap-2"
                                            aria-haspopup="true"
                                            aria-expanded={isDownloadMenuOpen}
                                        >
                                            <DownloadIcon className="w-4 h-4" />
                                            Download
                                        </button>
                                        {isDownloadMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-48 origin-top-right bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 animate-fade-in-fast">
                                                <ul className="py-1 text-sm text-gray-200" role="menu" aria-orientation="vertical">
                                                    <li>
                                                        <button
                                                            onClick={() => handleDownload('txt')}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                                                            role="menuitem"
                                                        >
                                                           Download as TXT
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button
                                                            onClick={() => handleDownload('html')}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                                                            role="menuitem"
                                                        >
                                                            Download as HTML
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                     <button
                                        onClick={handleClear}
                                        className="text-sm bg-red-800/50 hover:bg-red-700/50 text-red-300 font-medium py-2 px-3 rounded-md transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
                                {generatedEmails.map((genEmail, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-900/70 p-3 rounded-lg">
                                        <span className="text-gray-300 font-mono select-all break-all">{genEmail}</span>
                                        <button
                                            onClick={() => handleCopy(genEmail, index)}
                                            className="ml-4 p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                            aria-label="Copy email"
                                        >
                                            {copiedIndex === index ? (
                                                <CheckIcon className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <CopyIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                 <footer className="text-center mt-8 text-gray-500 text-sm">
                    <p>
                        This tool demonstrates how Gmail ignores dots in usernames. For example, <code className="bg-gray-700/50 px-1 py-0.5 rounded">john.doe</code> and <code className="bg-gray-700/50 px-1 py-0.5 rounded">johndoe</code> are the same address.
                    </p>
                </footer>
            </main>
        </div>
    );
}
