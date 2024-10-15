'use client';
import styles from "./page.module.css";
import { pdfjs, Document, Page } from "react-pdf";
import {ChangeEvent, useMemo, useState} from "react";
import {PDFDocumentProxy} from "pdfjs-dist";
import Button from "@/components/Button";
import {degrees, PDFDocument } from "pdf-lib";
import Popover from "@/components/Popover";
import Head from "next/head";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Home() {
  const [file, setFile] = useState<File>();
  const [numPages, setNumPages] = useState(0);
  const [rotations, setRotations] = useState<number[]>([]);
  const [pageHeight, setPageHeight] = useState(290);
  const [pageWidth, setPageWidth] = useState(200);
  const [isAddDisable, setIsAddDisable] = useState(false);
  const [isDecDisable, setIsDecDisable] = useState(false);
  const fileSlice = useMemo(()=>file?.slice(0),[file])

  const onInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files as FileList;
    if (!files || !files[0]) return;
    setFile(files[0]);
  }

  const onDocumentLoadSuccess = (pdfDocumentProxy: PDFDocumentProxy) => {
    setNumPages(pdfDocumentProxy.numPages)
    setRotations(new Array(pdfDocumentProxy.numPages).fill(0));
  }

  const onPageClick = (index:number) => {
    setRotations((prevRotations) => {
      const updatedRotations = [...prevRotations];
      updatedRotations[index] = (updatedRotations[index] + 90) % 360; // Rotate 90 degrees clockwise
      return updatedRotations;
    });
  }

  const removeFile = () => {
    setFile(undefined)
    setNumPages(0);
    setRotations([]);
  }

  const rotateAll = () => {
    setRotations(rotations.map(item => (item+90)%360))
  }

  const onAddClick = () => {
    if (pageWidth > 280) {
      setIsAddDisable(true)
      return
    }
    if (isDecDisable) setIsDecDisable(false)
    setPageHeight(pageHeight+40)
    setPageWidth(pageWidth+40)
  }

  const onDecClick = () => {
    if (pageWidth < 160) {
      setIsDecDisable(true)
      return
    }
    if (isAddDisable) setIsAddDisable(false)
    setPageHeight(pageHeight-40)
    setPageWidth(pageWidth-40)
  }

  const onDownloadClick = async () => {
    if (!file) return;
    if (!fileSlice) return
    const pdfDoc = await PDFDocument.load(await fileSlice.arrayBuffer());

    pdfDoc.getPages().forEach((page, index) => {
      const currentRotation = rotations[index];
      page.setRotation(degrees(currentRotation));
    });

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rotated_${file.name}`;
    link.click();
  }

  return (
    <div className={styles.page}>
      <Head>
        <title>Rotate PDF Online | Rotate Your PDF</title>
        <meta name="description" content="Easily rotate individual pages of your PDF online and download the updated file. Upload your PDF, rotate pages, and save the changes." />
        <meta name="keywords" content="PDF rotate, rotate PDF online, rotate PDF pages, online PDF editor, PDF rotation tool" />
        <meta property="og:title" content="Rotate PDF Pages Online" />
        <meta property="og:description" content="Upload and rotate PDF pages online. Easily adjust page orientation and export the modified PDF." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rotate PDF Pages Online" />
        <meta name="twitter:description" content="Rotate PDF pages and download your modified file." />
      </Head>
      <h1 className={styles.title}>
        Rotate PDF Pages
      </h1>
      <p className={styles.description}>Simply click on a page to rotate it. You can then download your modified PDF.</p>
      {
        file ? (
          <>
            <div className={styles.buttons}>
              <Button text="Rotate all" onClick={rotateAll}/>
              <Popover overlay={
                <Tip text="Remove this PDF and select a new one"/>
              }>
                <Button type="dark" text="Remove PDF" onClick={removeFile}/>
              </Popover>
              <Popover overlay={
                <Tip text="Zoom in"/>
              }>
                <Button shape="circle" disabled={isAddDisable}>
                  <div className={styles.add} onClick={onAddClick}/>
                </Button>
              </Popover>
              <Popover overlay={
                <Tip text="Zoom out"/>
              }>
                <Button shape="circle" disabled={isDecDisable}>
                  <div className={styles.dec} onClick={onDecClick}/>
                </Button>
              </Popover>
            </div>
            <Document
              file={fileSlice}
              onLoadSuccess={onDocumentLoadSuccess}
              className={styles.document}
            >
              {
                new Array(numPages).fill('').map((item, index) => {
                  return (
                    <div key={index}
                         className={styles.pageContainer}
                         style={{'height':pageHeight,'width':pageWidth}}
                    >
                      <Page
                        className={styles.pdfPage}
                        pageNumber={index + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        onClick={() => onPageClick(index)}
                        rotate={rotations[index]}
                        height={pageHeight}
                        width={pageWidth}
                      />
                      <div className={styles.pageNumber}>{index + 1}</div>
                      <div className={styles.rotateButton} onClick={() => onPageClick(index)}>
                        <svg className={styles.rotateButtonSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                          <path d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 0-24 10.7-24 24z"></path>
                        </svg>
                      </div>
                    </div>
                  )
                })
              }
            </Document>
            <div className={styles.downloadButton}>
              <Button text="Download" onClick={onDownloadClick}/>
            </div>
          </>
        ) : (
          <div className={styles.uploadButton}>
            <input type="file" accept="application/pdf" onChange={(e) => onInputChange(e)}/>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={styles.icon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"></path>
            </svg>
            <div className={styles.uploadButtonText}>
              Click to upload or drag and drop
            </div>
          </div>
        )
      }
    </div>
  );
}

const Tip = ({text}:{text:string}) => {
  return (
    <div className={styles.tip}>
      {text}
      <div className={styles.triangle}/>
    </div>
  )
}