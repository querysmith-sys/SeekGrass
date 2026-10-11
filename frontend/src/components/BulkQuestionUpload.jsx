import { useState } from 'react';
import { submitRiddleQuestions } from '../services/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_REQUEST_SIZE = 90 * 1024;
const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

function parseQuestions(XLSX, workbook) {
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    throw new Error('The workbook has no readable first worksheet.');
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: true,
  });

  const header = rows[0]?.[0]?.toString().trim();
  const otherHeaders = rows[0]?.slice(1).some((cell) => cell.toString().trim());

  const range = worksheet['!ref']
    ? XLSX.utils.decode_range(worksheet['!ref'])
    : { s: { c: 0 }, e: { c: 0 } };
  const hasHeaderFormula = Array.from({ length: range.e.c + 1 }, (_, column) => (
    worksheet[XLSX.utils.encode_cell({ r: 0, c: column })]?.f
  )).some(Boolean);

  if (
    range.s.r !== 0 ||
    range.s.c !== 0 ||
    header !== 'question' ||
    otherHeaders ||
    hasHeaderFormula ||
    !['s', 'str'].includes(worksheet.A1?.t)
  ) {
    throw new Error('Cell A1 must be the only header and must say "question".');
  }

  const questions = [];
  const seenQuestions = new Set();

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const values = row.map((cell) => cell.toString().trim());
    const hasFormula = Array.from({ length: range.e.c + 1 }, (_, column) => (
      worksheet[XLSX.utils.encode_cell({ r: rowNumber - 1, c: column })]?.f
    )).some(Boolean);

    if (hasFormula) {
      throw new Error(`Row ${rowNumber} contains a formula. Enter each riddle as plain text.`);
    }

    if (values.some(Boolean) && values.slice(1).some(Boolean)) {
      throw new Error(`Row ${rowNumber} has extra content. Put each riddle in column A only.`);
    }

    const question = values[0];
    if (!question) {
      if (values.some(Boolean)) {
        throw new Error(`Row ${rowNumber} is missing a question in column A.`);
      }
      return;
    }

    const questionCell = worksheet[XLSX.utils.encode_cell({ r: rowNumber - 1, c: 0 })];
    if (!['s', 'str'].includes(questionCell?.t)) {
      throw new Error(`Row ${rowNumber} must contain a text question in column A.`);
    }

    const normalizedQuestion = question.replace(/\s+/g, ' ').toLowerCase();
    if (seenQuestions.has(normalizedQuestion)) {
      throw new Error(`Row ${rowNumber} duplicates a riddle already in this file.`);
    }

    seenQuestions.add(normalizedQuestion);
    questions.push(question);
  });

  if (questions.length === 0) {
    throw new Error('Add at least one riddle below the question header.');
  }

  if (new Blob([JSON.stringify({ questions })]).size > MAX_REQUEST_SIZE) {
    throw new Error('This batch is too large. Split the riddles into smaller files under 90 KB.');
  }

  return questions;
}

function BulkQuestionUpload({ onClose }) {
  const [questions, setQuestions] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const downloadTemplate = async () => {
    try {
      const XLSX = await import('@e965/xlsx');
      const workbook = XLSX.utils.book_new();
      const questionsSheet = XLSX.utils.aoa_to_sheet([['question']]);
      questionsSheet['!cols'] = [{ wch: 90 }];
      questionsSheet['!freeze'] = { xSplit: 0, ySplit: 1 };
      XLSX.utils.book_append_sheet(workbook, questionsSheet, 'Questions');

      const instructionsSheet = XLSX.utils.aoa_to_sheet([
        ['QUESTION BANK UPLOAD — FORMAT GUIDE'],
        ['Use the Questions worksheet as the upload sheet.'],
        ['Cell A1 must contain the exact header: question'],
        ['Enter one complete riddle per row in column A.'],
        ['Keep each multi-line riddle inside a single cell.'],
        ['Do not add other columns or formulas. Blank rows are ignored.'],
        ['Example riddle:'],
        ['I speak without a mouth and hear without ears.'],
        ['I have no body, but I come alive with wind. What am I?'],
      ]);
      instructionsSheet['!cols'] = [{ wch: 90 }];
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
      XLSX.writeFile(workbook, 'seekgrass-question-template.xlsx');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create the template file.');
    }
  };

  const handleFileChange = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    setQuestions([]);
    setFileName(file?.name || '');
    setErrorMessage('');
    setSuccessMessage('');

    if (!file) {
      return;
    }

    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setErrorMessage('Choose an Excel workbook (.xlsx or .xls) or a .csv file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('The spreadsheet must be 5 MB or smaller.');
      return;
    }

    setIsReading(true);
    try {
      const XLSX = await import('@e965/xlsx');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      setQuestions(parseQuestions(XLSX, workbook));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to read this spreadsheet. Check the file and try again.',
      );
    } finally {
      setIsReading(false);
    }
  };

  const handleSubmit = async () => {
    if (questions.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await submitRiddleQuestions(questions);
      setSuccessMessage(`${questions.length} riddles added to the question bank.`);
      setQuestions([]);
      setFileName('');
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Unable to add these riddles. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="bulk-question-upload"
      className="bulk-upload-panel panel-surface"
      aria-labelledby="bulk-upload-title"
    >
      <div className="bulk-upload-heading">
        <div>
          <span className="section-badge">QUESTION_BANK // IMPORT</span>
          <h2 id="bulk-upload-title">Add riddles in bulk.</h2>
          <p>Use one question per row, then review the batch before it reaches mission control.</p>
        </div>
        <button type="button" className="ghost-button" onClick={onClose}>
          CLOSE
        </button>
      </div>

      <ol className="bulk-upload-instructions">
        <li><strong>A1:</strong> Enter the exact header <code>question</code>.</li>
        <li><strong>Column A:</strong> Put one complete riddle on each row.</li>
        <li><strong>Multi-line riddles:</strong> Keep all lines together in one cell.</li>
      </ol>

      <div className="bulk-upload-actions">
        <button type="button" className="secondary-button" onClick={downloadTemplate}>
          DOWNLOAD EXCEL TEMPLATE
        </button>
        <label className="bulk-file-picker">
          <span>{fileName || 'CHOOSE SPREADSHEET'}</span>
          <input
            id="question-spreadsheet"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={isReading || isSubmitting}
          />
        </label>
      </div>
      <p className="bulk-upload-note">Accepts .xlsx, .xls, or .csv. Maximum file size: 5 MB; batch size: 90 KB.</p>

      {isReading && <div className="bulk-upload-message" role="status">READING SPREADSHEET...</div>}

      {errorMessage && <div className="alert alert-error" role="alert">{errorMessage}</div>}

      {successMessage && <div className="bulk-upload-success" role="status">{successMessage}</div>}

      {questions.length > 0 && (
        <div className="bulk-upload-preview">
          <div className="bulk-preview-heading">
            <strong>{questions.length} VALID RIDDLE{questions.length === 1 ? '' : 'S'} READY</strong>
            <span>Preview</span>
          </div>
          <ul>
            {questions.slice(0, 3).map((question, index) => (
              <li key={`${index}-${question}`}>{question}</li>
            ))}
          </ul>
          {questions.length > 3 && (
            <p className="bulk-preview-more">+ {questions.length - 3} more riddles in this batch</p>
          )}
          <button
            type="button"
            className="primary-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'ADDING RIDDLES...' : `ADD ${questions.length} RIDDLE${questions.length === 1 ? '' : 'S'} →`}
          </button>
        </div>
      )}
    </section>
  );
}

export default BulkQuestionUpload;
