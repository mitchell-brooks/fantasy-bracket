'use client';
import React from 'react';
import Papa from 'papaparse';

interface DownloadButtonProps {
  buttonText?: string;
  tooltipText?: string;
  data: BlobPart;
  filename?: string;
  contentType?: string;
}

const downloadFile = (data: BlobPart, filename: string, type: string) => {
  const url = window.URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}`);

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();

  // Clean up and remove the link
  link.parentNode?.removeChild(link);
};
export const DownloadButton: React.FC<DownloadButtonProps> = ({
  buttonText = 'Download',
  tooltipText = 'Download the data as a CSV file',
  data,
  filename = 'fantasy-bracket-data.csv',
  contentType = 'text/csv',
}) => {
  return (
    <button
      title={tooltipText}
      onClick={() => downloadFile(data, filename, contentType)}
    >
      {buttonText}
    </button>
  );
};
