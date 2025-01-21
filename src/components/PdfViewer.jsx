import React, { Component, useCallback, useState } from "react";

import PropTypes from "prop-types";
import { Pagination } from "react-bootstrap";
import { sdgColors, sdgDataDefault } from "./utils.js";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";

// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.8.162/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.js",
//   import.meta.url
// ).toString();

class PdfViewer extends Component {
  constructor(props) {
    super(props);
    const { onPageChange } = this.props;
    this.onPageChange = onPageChange;
  }

  onDocumentLoadSuccess = ({ newNumPages }) => {
    this.setState({
      numPages: newNumPages,
    });
    this.onPageChange(1);
  };

  changePage = (offset) => {
    this.onPageChange((prevPageNumber) => prevPageNumber + offset);
  };

  previousPage = () => {
    this.changePage(-1);
  };

  nextPage = () => {
    this.changePage(1);
  };

  render() {
    const {
      file,
      numPages,
      pageNumber,
      sdgActive,
      keywordsAll,
      keywords,
      sequences,
    } = this.props;
    // const { numPages } = this.state;

    let searchWords = [];
    if (keywords.length > 0) {
      searchWords = keywords.map((keyword) => keyword.word);
    }

    let searchSequences = [];
    if (sequences.length > 0) {
      searchSequences = sequences.map((sequence) => sequence.sequence);
    }

    // function textRenderer(textItem) {
    //   let markedTextItem = textItem.str;
    //   if (sdgActive) {
    //     searchWords.forEach((text) => {
    //       markedTextItem = markedTextItem.replace(text, (value) => {
    //         return `<mark class="word">${value}</mark>`;
    //       });
    //     });
    //     searchSequences.forEach((text) => {
    //       markedTextItem = markedTextItem.replace(text, (value) => {
    //         return `<mark class="sequence">${value}</mark>`;
    //       });
    //     });
    //   } else {
    //     keywordsAll.forEach((text) => {
    //       markedTextItem = markedTextItem.replace(text, (value) => {
    //         return `<mark class="wordAll">${value}</mark>`;
    //       });
    //     });
    //   }

    //   return markedTextItem;
    // }

    function textRenderer(textItem) {
      let markedTextItem = textItem.str;
      if (sdgActive) {
        searchWords.forEach((text) => {
          const regex = new RegExp(text, "gi"); // g for global, i for case-insensitive
          markedTextItem = markedTextItem.replace(regex, (value) => {
            return `<mark class="word">${value}</mark>`;
          });
        });
        searchSequences.forEach((text) => {
          const regex = new RegExp(text, "gi"); // g for global, i for case-insensitive
          markedTextItem = markedTextItem.replace(regex, (value) => {
            return `<mark class="sequence">${value}</mark>`;
          });
        });
      } else {
        keywordsAll.forEach((text) => {
          const regex = new RegExp(text, "gi"); // g for global, i for case-insensitive
          markedTextItem = markedTextItem.replace(regex, (value) => {
            return `<mark class="wordAll">${value}</mark>`;
          });
        });
      }
      return markedTextItem;
    }

    return (
      <>
        <style type="text/css">
          {`
        mark.word {
            background-color: ${sdgColors[sdgActive]};
            color: black;
        }
        mark.sequence {
            background-color: ${sdgColors[sdgActive] + "80"};
            color: black;
        }
        mark.wordAll {
            background-color: #C3ACD0;
        }
        
        .react-pdf__Page  {
            background-color: inherit !important;
            min-width: min-content !important;
            display: flex; 
            justify-content: center; 
        }
        .pdf-container {
            display: flex;
            justify-content: center;
        }

        
        .pagination-container {
            display: flex;
            justify-content: center;
            margin-top: 15px; /* Add margin for spacing, adjust as needed */
        }
        .pagination-container .pagination .page-item.active .page-link {
            background-color: lightgray;
            border-color: lightgray;
        }
        .pagination-container .pagination .page-link {
            color: black; /* Change text color if needed */
        }
        .pagination-container .pagination .page-link:hover {
            background-color: lightgray;
            border-color: lightgray;
        }
        .pagination-container .pagination .page-item.disabled .page-link {
            color: gray;
        }
    `}
        </style>
        <div className="pdf-container">
          <Document
            file={file}
            onLoadSuccess={this.onDocumentLoadSuccess}
            onLoadError={console.error}
          >
            <Page
              pageNumber={pageNumber}
              renderAnnotationLayer={false} // remove empty space under report page
            />
          </Document>
        </div>

        <div className="pagination-container">
          <Pagination>
            <Pagination.First
              onClick={() => this.onPageChange(1)}
              disabled={pageNumber <= 1}
            />
            <Pagination.Prev
              onClick={this.previousPage}
              disabled={pageNumber <= 1}
            />

            <Pagination.Item
              onClick={() => this.onPageChange(1)}
              active={pageNumber === 1}
            >
              {pageNumber}
            </Pagination.Item>

            <Pagination.Next
              onClick={this.nextPage}
              disabled={pageNumber >= numPages}
            />
            <Pagination.Last
              onClick={() => this.onPageChange(numPages)}
              disabled={pageNumber >= numPages}
            />
          </Pagination>
        </div>
      </>
    );
  }
}

// PdfViewer.defaultProps = {
//   file: "hallo",
//   sdgData: sdgDataDefault,
// };
// PdfViewer.propTypes = {
//   file: PropTypes.string,
//   sdgData: PropTypes.any,
// };

export default PdfViewer;
