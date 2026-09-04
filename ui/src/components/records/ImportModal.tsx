import React, { useState, useRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  ModalOverlay,
  Modal,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Badge,
  Select,
  SelectItem,
  Spinner,
  Alert,
  toastQueue,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import {
  UploadSimpleIcon,
  FileIcon,
  FileCodeIcon,
  FileCsvIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  XIcon,
  ArrowsClockwiseIcon,
} from '@phosphor-icons/react';
import { api } from '../../api/client';

export interface ImportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  moulName: string;
  onSuccess?: () => void;
}

interface ImportResult {
  success: boolean;
  mode: string;
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors?: Array<{ row: number; id?: string; message: string }>;
}

const styles = stylex.create({
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  headerTitle: {
    fontSize: tokens.fontSizeLg,
    fontWeight: 700,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing4,
    paddingBlock: tokens.spacing2,
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing3,
    padding: tokens.spacing6,
    borderRadius: tokens.radiusLg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: tokens.colorBorderSubtle,
    backgroundColor: tokens.colorBgElevated,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  dropzoneActive: {
    borderColor: tokens.colorPrimary500,
    backgroundColor: tokens.colorBgSubtle,
  },
  dropzoneIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: tokens.radiusFull,
    backgroundColor: tokens.colorBgSubtle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorPrimary500,
  },
  dropzoneTitle: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 600,
    color: tokens.colorFg,
  },
  dropzoneSub: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
  },
  filePill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing3,
    backgroundColor: tokens.colorBgElevated,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing3,
  },
  fileMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  fileName: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 600,
    color: tokens.colorFg,
  },
  fileSize: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacing3,
  },
  resultStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: tokens.spacing2,
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing3,
    borderRadius: tokens.radiusMd,
    backgroundColor: tokens.colorBgElevated,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
  },
  statVal: {
    fontSize: tokens.fontSizeXl,
    fontWeight: 700,
    color: tokens.colorFg,
  },
  statValSuccess: {
    color: tokens.colorSuccess500,
  },
  statValPrimary: {
    color: tokens.colorPrimary500,
  },
  statValMuted: {
    color: tokens.colorFgSubtle,
  },
  statLabel: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
    marginTop: '2px',
  },
  errorList: {
    maxHeight: '180px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing1,
    padding: tokens.spacing2,
    backgroundColor: tokens.colorBgElevated,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: tokens.fontSizeXs,
  },
  errorItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
    color: tokens.colorError500,
  },
});

export function ImportModal({
  isOpen,
  onOpenChange,
  moulName,
  onSuccess,
}: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'upsert' | 'insert' | 'replace'>('upsert');
  const [onError, setOnError] = useState<'atomic' | 'continue'>('atomic');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setResult(null);
    setIsUploading(false);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = e.dataTransfer.files[0];
      const ext = dropped.name.slice(dropped.name.lastIndexOf('.')).toLowerCase();
      if (ext === '.csv' || ext === '.json') {
        setFile(dropped);
        setResult(null);
      } else {
        toastQueue.add({
          title: 'Invalid File',
          description: 'Only .csv and .json files are supported for import.',
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleExecuteImport = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await api.importRecords(moulName, file, {
        mode,
        onError,
      });

      setResult(res);
      toastQueue.add({
        title: 'Import Finished',
        description: `Imported ${res.total} records into ${moulName}.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toastQueue.add({
        title: 'Import Failed',
        description: err.message || 'Failed to import records.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={handleClose} isDismissable={!isUploading}>
      <Modal size="lg">
        <ModalDialog aria-label={`Import records into ${moulName}`}>
          <ModalHeader>
            <div {...stylex.props(styles.header)}>
              <h2 {...stylex.props(styles.headerTitle)}>
                <UploadSimpleIcon size={20} color={tokens.colorPrimary500} />
                <span>Import Records - {moulName}</span>
              </h2>
            </div>
          </ModalHeader>

          <ModalBody>
            <div {...stylex.props(styles.content)}>
              {/* Show Result View if Finished */}
              {result ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing4 }}>
                  <Alert variant={result.errors && result.errors.length > 0 ? 'warning' : 'success'}>
                    {result.errors && result.errors.length > 0
                      ? `Import partially completed with ${result.errors.length} error(s).`
                      : 'Records imported and synchronized successfully!'}
                  </Alert>

                  <div {...stylex.props(styles.resultStats)}>
                    <div {...stylex.props(styles.statCard)}>
                      <span {...stylex.props(styles.statVal)}>{result.total}</span>
                      <span {...stylex.props(styles.statLabel)}>Total</span>
                    </div>
                    <div {...stylex.props(styles.statCard)}>
                      <span {...stylex.props(styles.statVal, styles.statValSuccess)}>
                        {result.inserted}
                      </span>
                      <span {...stylex.props(styles.statLabel)}>Inserted</span>
                    </div>
                    <div {...stylex.props(styles.statCard)}>
                      <span {...stylex.props(styles.statVal, styles.statValPrimary)}>
                        {result.updated}
                      </span>
                      <span {...stylex.props(styles.statLabel)}>Updated</span>
                    </div>
                    <div {...stylex.props(styles.statCard)}>
                      <span {...stylex.props(styles.statVal, styles.statValMuted)}>
                        {result.skipped}
                      </span>
                      <span {...stylex.props(styles.statLabel)}>Skipped</span>
                    </div>
                  </div>

                  {result.errors && result.errors.length > 0 && (
                    <div>
                      <span style={{ fontSize: tokens.fontSizeSm, fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                        Row Errors ({result.errors.length}):
                      </span>
                      <div {...stylex.props(styles.errorList)}>
                        {result.errors.map((e, idx) => (
                          <div key={idx} {...stylex.props(styles.errorItem)}>
                            <WarningCircleIcon size={14} />
                            <span>Row {e.row}: {e.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* File Upload Zone */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />

                  {!file ? (
                    <div
                      {...stylex.props(
                        styles.dropzone,
                        isDragOver && styles.dropzoneActive
                      )}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                    >
                      <div {...stylex.props(styles.dropzoneIconWrap)}>
                        <UploadSimpleIcon size={24} />
                      </div>
                      <div>
                        <span {...stylex.props(styles.dropzoneTitle)}>
                          Click to browse or drag & drop file
                        </span>
                        <div {...stylex.props(styles.dropzoneSub)}>
                          Supports CSV (comma-delimited) or JSON records array
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div {...stylex.props(styles.filePill)}>
                      <div {...stylex.props(styles.fileInfo)}>
                        {file.name.endsWith('.csv') ? (
                          <FileCsvIcon size={28} color={tokens.colorPrimary500} />
                        ) : (
                          <FileCodeIcon size={28} color={tokens.colorPrimary500} />
                        )}
                        <div {...stylex.props(styles.fileMeta)}>
                          <span {...stylex.props(styles.fileName)}>{file.name}</span>
                          <span {...stylex.props(styles.fileSize)}>
                            {formatFileSize(file.size)} • {file.name.endsWith('.csv') ? 'CSV' : 'JSON'}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Remove selected file"
                        onPress={() => setFile(null)}
                        isDisabled={isUploading}
                      >
                        <XIcon size={16} />
                      </Button>
                    </div>
                  )}

                  {/* Options */}
                  <div {...stylex.props(styles.optionsGrid)}>
                    <Select
                      label="Conflict Mode"
                      selectedKey={mode}
                      onSelectionChange={(key) => setMode(key as any)}
                      isDisabled={isUploading}
                    >
                      <SelectItem id="upsert">Upsert (Insert new, update by ID)</SelectItem>
                      <SelectItem id="insert">Insert Only (Fail on duplicate ID)</SelectItem>
                      <SelectItem id="replace">Replace (Truncate collection first)</SelectItem>
                    </Select>

                    <Select
                      label="Error Handling"
                      selectedKey={onError}
                      onSelectionChange={(key) => setOnError(key as any)}
                      isDisabled={isUploading}
                    >
                      <SelectItem id="atomic">Atomic (Rollback entire batch)</SelectItem>
                      <SelectItem id="continue">Continue (Skip invalid rows)</SelectItem>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            {result ? (
              <>
                <Button variant="outline" onPress={resetState}>
                  <ArrowsClockwiseIcon size={16} />
                  <span>Import Another File</span>
                </Button>
                <Button variant="primary" onPress={handleClose}>
                  Done
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onPress={handleClose} isDisabled={isUploading}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onPress={handleExecuteImport}
                  isDisabled={!file || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Spinner size="sm" />
                      <span>Importing records...</span>
                    </>
                  ) : (
                    <>
                      <UploadSimpleIcon size={16} />
                      <span>Execute Import</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalDialog>
      </Modal>
    </ModalOverlay>
  );
}
