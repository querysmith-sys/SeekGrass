import { useEffect, useState } from 'react';

function RiddleSubmissionForm({ riddle, onSubmit, isSubmitting }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    onSubmit({ riddle, image: selectedFile });
  };

  return (
    <form className="submission-form panel-surface" onSubmit={handleSubmit}>
      <div className="form-header">
        <label htmlFor="riddle-photo" className="form-label">
          Upload evidence
        </label>
        <input
          id="riddle-photo"
          className="file-input"
          type="file"
          accept="image/*"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
        />
      </div>

      {previewUrl ? (
        <>
          <div className="image-preview-wrapper">
            <img src={previewUrl} alt="Selected challenge preview" className="image-preview" />
          </div>
          <div className="upload-meta">
            <span>File:</span>
            <strong>{selectedFile?.name || 'unknown'}</strong>
          </div>
        </>
      ) : (
        <div className="placeholder-box">Choose an image to verify your guess.</div>
      )}

      <button type="submit" className="primary-button" disabled={isSubmitting || !selectedFile}>
        {isSubmitting ? 'Checking evidence...' : 'Submit evidence →'}
      </button>
    </form>
  );
}

export default RiddleSubmissionForm;
