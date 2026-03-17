// ABOUTME: CSV file upload button that parses and validates draft ranking files
// ABOUTME: Uses PapaParse to stream-parse CSV rows, validate headers, and detect duplicate rankings
"use client";
import Papa, { ParseStepResult } from "papaparse";
import React, { useRef } from "react";
import { DraftViewRow } from "@lib/api";

interface UploadButtonProps {
  onUpload: (data: any) => void;
  allDraftablePlayers: Record<string, boolean>;
}

// we already match the header, all required key is present
// Do the Data processing here
function processRow<T>(
  row: ParseStepResult<T>,
  rankings: Array<Record<string, number>>
) {
  let rowError = "";
  const { player_unique, ranking, team_name, seed, points, player_name } =
    row.data as unknown as Record<string, any>;
  const rankNum = Number(ranking);
  if (isNaN(rankNum)) {
    rowError = `Encountered an error trying to process ranking ${ranking}. Please check your csv file and try again.`;
  }
  if (rankings[rankNum]) {
    // Duplicate ranking
    rowError = `Duplicate ranking found at ${ranking}. Please check your csv file and try again.`;
  }
  if (ranking && !rowError) {
    rankings[rankNum] = {
      ranking: rankNum,
      ...row.data
    };
  }
  return rowError;
}

export const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      let headersMatch = false;
      const rankings: Array<Record<string, number>> = [];
      Papa.parse<DraftViewRow>(file, {
        header: true,
        skipEmptyLines: true,
        step: function(row, parser) {
          if (!headersMatch) {
            //Only check if flag is not set, i.e, for the first time
            parser.pause(); // pause the parser
            const first_row_data = row.data as unknown as Record<string, any>;
            // Now check object keys, if it match
            // TODO: pull out this predicate as a match condition to genericize
            if (
              "player_unique" in first_row_data &&
              "ranking" in first_row_data
            ) {
              //every required key is present
              headersMatch = true;
              // Do your data processing here
              processRow(row, rankings);
              parser.resume();
            } else {
              //some key is missing, abort parsing
              window.alert(
                "It looks like your csv file doesn't have the correct headers. The uploader expects to find a `ranking` and `player_unique` in the very first row of your file. Did you rename those columns or did they get sorted out of the first row? Please make sure the column headers are in the first row of the spreadsheet."
              );
              parser.abort();
            }
          } else {
            // we already match the header, all required key is present
            // Do the Data processing here
            const rowError = processRow(row, rankings);
            if (rowError) {
              // TODO: Error handling
              window.alert(rowError);
              parser.abort();
            }
          }
        },
        complete: ({ errors, meta: { aborted } }) => {
          if (errors.length) {
            window.alert(
              "There may have been an error parsing your csv. Please double check your rankings below."
            );
          }
          if (!aborted) onUpload(rankings);
        }
      });
    }
  };

  return (
    <>
      <button
        title="Upload a CSV file with your rankings instead of using the grid interface"
        onClick={() => fileInputRef.current?.click()}
      >
        Upload Rankings CSV
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={(e) => {
          handleOnChange(e);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      />
    </>
  );
};
