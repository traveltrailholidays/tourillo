declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  export interface UserOptions {
    head?: any[][];
    body?: any[][];
    html?: string;
    startY?: number;
    theme?: 'striped' | 'grid' | 'plain';
    styles?: any;
    headStyles?: any;
    bodyStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: any;
    margin?: any;
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): void;
}
