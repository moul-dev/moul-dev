import React, { useState, useMemo, useRef } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { z } from 'zod';
import {
  PlusIcon,
  TrashIcon,
  PencilSimpleIcon,
  DatabaseIcon,
  CaretLeftIcon,
  CaretRightIcon,
  FileIcon,
  ArrowSquareOutIcon,
  CloudArrowUpIcon,
  UploadSimpleIcon,
  LinkIcon,
  ArrowsCounterClockwiseIcon,
  ProhibitIcon,
  CopyIcon,
  CheckIcon,
  ClockIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  CodeIcon,
  ListBulletsIcon,
  InfoIcon,
} from '@phosphor-icons/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableSkeleton,
  TableEmpty,
  EmptyState,
  Badge,
  Button,
  Card,
  CardBody,
  SearchField,
  TextField,
  TextArea,
  Select,
  SelectItem,
  Checkbox,
  Spinner,
  DrawerOverlay,
  Drawer,
  DrawerDialog,
  DrawerHeader,
  DrawerTitle,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  ModalOverlay,
  Modal,
  AlertDialog,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  toastQueue,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../../../api/client';

const recordsSearchSchema = z.object({
  page: z.number().optional().default(1),
  perPage: z.number().optional().default(30),
  sort: z.string().optional(),
  filter: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  create: z.boolean().optional(),
});

export const Route = createFileRoute('/_auth/records/$moulName')({
  validateSearch: (search) => recordsSearchSchema.parse(search),
  component: RecordsPage,
});

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing4,
    maxWidth: '1200px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  searchBox: {
    width: '360px',
  },
  drawerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing4,
    paddingInline: tokens.spacing1,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: tokens.spacing2,
    fontSize: '0.875rem',
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
  },
  paginationButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
  },
  fileInputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing1,
    fontFamily: tokens.fontFamilyBase,
  },
  fileLabel: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 500,
    color: tokens.colorFg,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: tokens.colorBorder,
    borderRadius: tokens.radiusMd,
    backgroundColor: tokens.colorBgSubtle,
    cursor: 'pointer',
    gap: tokens.spacing2,
    textAlign: 'center',
    transition: 'all 0.15s ease',
  },
  dropzoneDragging: {
    borderColor: tokens.colorPrimary500,
    backgroundColor: tokens.colorBgElevated,
  },
  dropzoneText: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
  },
  attachedCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing2,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    borderRadius: tokens.radiusMd,
    backgroundColor: tokens.colorBgElevated,
    gap: tokens.spacing3,
  },
  attachedLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing3,
    minWidth: 0,
    flex: 1,
  },
  attachedThumb: {
    width: '44px',
    height: '44px',
    borderRadius: tokens.radiusSm,
    objectFit: 'cover',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    flexShrink: 0,
  },
  attachedIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: tokens.radiusSm,
    backgroundColor: tokens.colorBgSubtle,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  attachedInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
    flex: 1,
  },
  attachedName: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 500,
    color: tokens.colorFg,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  attachedMeta: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  attachedActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexShrink: 0,
  },
  recordIdBtn: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: tokens.fontSizeXs,
    fontWeight: 600,
    color: tokens.colorPrimary500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 7px',
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textDecoration: 'none',
    ':hover': {
      backgroundColor: tokens.colorBgSubtle,
      borderColor: tokens.colorBorderSubtle,
      color: tokens.colorPrimary400,
    },
  },
  workerInspector: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
    padding: tokens.spacing3,
    backgroundColor: tokens.colorBgElevated,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
  },
  workerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacing2,
  },
  workerTitle: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 600,
    color: tokens.colorFg,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
  },
  workerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: tokens.spacing2,
  },
  workerStatCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: tokens.spacing2,
    backgroundColor: tokens.colorBgSubtle,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
  },
  statLabel: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  statVal: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: 'var(--font-mono, monospace)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  errorTraceBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
    padding: tokens.spacing3,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: tokens.radiusMd,
  },
  errorTraceHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorTraceTitle: {
    fontSize: tokens.fontSizeXs,
    fontWeight: 600,
    color: tokens.colorError500,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  errorTraceContent: {
    margin: 0,
    padding: tokens.spacing2,
    backgroundColor: tokens.colorBgSubtle,
    borderRadius: tokens.radiusSm,
    color: tokens.colorError500,
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono, monospace)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: '160px',
    overflowY: 'auto',
  },
  sectionTitle: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 600,
    color: tokens.colorFg,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
    paddingTop: tokens.spacing2,
    paddingBottom: tokens.spacing1,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorBorderSubtle,
  },
  metadataCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
    padding: tokens.spacing3,
    backgroundColor: tokens.colorBgSubtle,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.75rem',
    color: tokens.colorFgSubtle,
  },
  metadataRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing2,
  },
  jsonBlock: {
    margin: 0,
    padding: tokens.spacing2,
    backgroundColor: tokens.colorBgElevated,
    borderRadius: tokens.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    color: tokens.colorFg,
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono, monospace)',
    maxHeight: '180px',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
});

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileUrl(fileData: any): string {
  if (!fileData) return '';
  if (typeof fileData === 'string') return fileData;
  return fileData.url || '';
}

function getFileName(fileData: any): string {
  if (!fileData) return '';
  if (typeof fileData === 'string') {
    const parts = fileData.split('/');
    return parts[parts.length - 1] || fileData;
  }
  return fileData.filename || fileData.name || 'file';
}

function isImageFile(fileData: any): boolean {
  if (!fileData) return false;
  const url = typeof fileData === 'string' ? fileData : fileData.url || '';
  const filename = typeof fileData === 'string' ? fileData : fileData.filename || fileData.name || '';
  const isImgExt = /\.(jpg|jpeg|png|webp|gif|svg|avif|ico|bmp)$/i.test(url || filename);
  const hasThumb = Boolean(fileData.thumbhash || (fileData.thumbs && Object.keys(fileData.thumbs).length > 0));
  return isImgExt || hasThumb;
}

function getRecordDisplayLabel(rec: any): string {
  if (!rec) return '';
  if (typeof rec === 'string') return rec;
  if (rec.name) return String(rec.name);
  if (rec.title) return String(rec.title);
  if (rec.username) return String(rec.username);
  if (rec.email) return String(rec.email);
  if (rec.label) return String(rec.label);
  if (rec.slug) return String(rec.slug);
  if (rec.id) return String(rec.id);
  return JSON.stringify(rec);
}

function getWorkerStatusVariant(state?: string): 'success' | 'warning' | 'error' | 'primary' | 'neutral' {
  switch (String(state || '').toLowerCase()) {
    case 'completed':
      return 'success';
    case 'executing':
    case 'processing':
      return 'primary';
    case 'retryable':
      return 'warning';
    case 'discarded':
    case 'failed':
    case 'cancelled':
      return 'error';
    case 'available':
    default:
      return 'neutral';
  }
}

interface FileFieldInputProps {
  label: string;
  required?: boolean;
  value: any;
  onChange: (val: any) => void;
}

function FileFieldInput({ label, required, value, onChange }: FileFieldInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await api.uploadFile(file);
      if (Array.isArray(result) && result.length > 0) {
        onChange(result[0]);
      } else if (result && typeof result === 'object') {
        onChange(result);
      }
      toastQueue.add({
        title: 'File Uploaded',
        description: `${file.name} uploaded successfully.`,
        variant: 'success',
      });
    } catch (err: any) {
      toastQueue.add({
        title: 'Upload Failed',
        description: err.message || 'Failed to upload file.',
        variant: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const fileUrl = getFileUrl(value);
  const fileName = getFileName(value);
  const isImage = isImageFile(value);
  const fileSize = typeof value === 'object' && value?.size ? formatFileSize(value.size) : '';

  return (
    <div {...stylex.props(styles.fileInputWrapper)}>
      <label {...stylex.props(styles.fileLabel)}>
        <span>{label}</span>
        {required && <span style={{ color: tokens.colorError500 }}>*</span>}
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {value ? (
        <div {...stylex.props(styles.attachedCard)}>
          <div {...stylex.props(styles.attachedLeft)}>
            {isImage && fileUrl ? (
              <img
                src={fileUrl}
                alt={fileName}
                {...stylex.props(styles.attachedThumb)}
              />
            ) : (
              <div {...stylex.props(styles.attachedIconBox)}>
                <FileIcon size={22} color={tokens.colorPrimary500} />
              </div>
            )}
            <div {...stylex.props(styles.attachedInfo)}>
              <span {...stylex.props(styles.attachedName)} title={fileName}>
                {fileName}
              </span>
              <div {...stylex.props(styles.attachedMeta)}>
                {fileSize && <span>{fileSize}</span>}
                {value.created_at && (
                  <span>{new Date(value.created_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
          <div {...stylex.props(styles.attachedActions)}>
            {fileUrl && (
              <Button
                size="sm"
                variant="ghost"
                aria-label="View file"
                onPress={() => window.open(fileUrl, '_blank')}
              >
                <ArrowSquareOutIcon size={14} />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              aria-label="Replace file"
              isDisabled={isUploading}
              onPress={() => fileInputRef.current?.click()}
            >
              <UploadSimpleIcon size={14} />
              <span>Replace</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Remove file"
              isDisabled={isUploading}
              onPress={() => onChange(null)}
            >
              <TrashIcon size={14} color={tokens.colorError500} />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...stylex.props(styles.dropzone, isDragging && styles.dropzoneDragging)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!isUploading) fileInputRef.current?.click();
          }}
        >
          {isUploading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2, padding: tokens.spacing2 }}>
              <Spinner size="sm" />
              <span style={{ fontSize: tokens.fontSizeSm, color: tokens.colorFgSubtle }}>
                Uploading file to storage...
              </span>
            </div>
          ) : (
            <>
              <CloudArrowUpIcon size={28} color={tokens.colorPrimary500} />
              <div {...stylex.props(styles.dropzoneText)}>
                <span>Drag & drop a file here, or </span>
                <span style={{ color: tokens.colorPrimary500, fontWeight: 500 }}>browse</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface RelationFieldInputProps {
  label: string;
  required?: boolean;
  relationConfig?: {
    targetMoul: string;
    cardinality: string;
    onDelete?: string;
  };
  value: any;
  onChange: (val: any) => void;
}

function RelationFieldInput({ label, required, relationConfig, value, onChange }: RelationFieldInputProps) {
  const targetMoul = relationConfig?.targetMoul || '';
  const card = relationConfig?.cardinality || '1:N';

  // Query records from target collection
  const { data: targetData, isLoading } = useQuery({
    queryKey: ['records', targetMoul, 1, 100],
    queryFn: () => api.listRecords(targetMoul, { perPage: 100 }),
    enabled: Boolean(targetMoul),
  });

  const targetRecords = useMemo(() => {
    if (Array.isArray(targetData)) return targetData;
    if (targetData && Array.isArray(targetData.items)) return targetData.items;
    return [];
  }, [targetData]);

  if (card === 'M:N') {
    // Value is array of IDs
    const selectedIds: string[] = Array.isArray(value) ? value : value ? [String(value)] : [];

    const handleToggle = (id: string) => {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter((i) => i !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    };

    const handleRemove = (id: string) => {
      onChange(selectedIds.filter((i) => i !== id));
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label
            style={{
              fontSize: tokens.fontSizeSm,
              fontWeight: 500,
              color: tokens.colorFg,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <LinkIcon size={14} color={tokens.colorPrimary500} />
            <span>{label}</span>
            <Badge size="sm" variant="primary">
              M:N ➔ {targetMoul}
            </Badge>
            {required && <span style={{ color: tokens.colorError500 }}>*</span>}
          </label>
        </div>

        {/* Selected Badges */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: tokens.spacing1,
            minHeight: '36px',
            padding: '6px',
            backgroundColor: tokens.colorBgSubtle,
            borderRadius: tokens.radiusSm,
            border: `1px solid ${tokens.colorBorderSubtle}`,
            alignItems: 'center',
          }}
        >
          {selectedIds.length === 0 ? (
            <span style={{ fontSize: tokens.fontSizeXs, color: tokens.colorFgSubtle, padding: '2px 4px' }}>
              No records selected. Select records from the dropdown below to link.
            </span>
          ) : (
            selectedIds.map((id) => {
              const rec = targetRecords.find((r) => String(r.id) === String(id));
              const display = rec ? getRecordDisplayLabel(rec) : id;
              return (
                <span
                  key={id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: tokens.colorBgElevated,
                    border: `1px solid ${tokens.colorPrimary500}`,
                    borderRadius: tokens.radiusSm,
                    padding: '2px 8px',
                    fontSize: tokens.fontSizeXs,
                    color: tokens.colorFg,
                  }}
                >
                  <LinkIcon size={12} color={tokens.colorPrimary500} />
                  <span>{display}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: tokens.colorFgSubtle,
                      fontSize: '14px',
                      lineHeight: 1,
                      marginLeft: '2px',
                    }}
                    aria-label={`Remove ${display}`}
                  >
                    &times;
                  </button>
                </span>
              );
            })
          )}
        </div>

        {/* Add Record Dropdown */}
        <Select
          aria-label={`Add ${label} record`}
          placeholder={isLoading ? 'Loading records...' : `Select record to add to ${label}...`}
          selectedKey=""
          onSelectionChange={(key) => {
            if (key && String(key) !== '' && String(key) !== '__placeholder__') {
              handleToggle(String(key));
            }
          }}
        >
          <SelectItem id="__placeholder__" textValue="Select record to link...">
            <em>Select record to link...</em>
          </SelectItem>
          {targetRecords
            .filter((r) => !selectedIds.includes(String(r.id)))
            .map((rec) => (
              <SelectItem key={rec.id} id={rec.id} textValue={getRecordDisplayLabel(rec)}>
                {getRecordDisplayLabel(rec)} ({rec.id})
              </SelectItem>
            ))}
        </Select>
      </div>
    );
  }

  // 1:1 or 1:N
  const currentVal = value ? String(value) : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label
          style={{
            fontSize: tokens.fontSizeSm,
            fontWeight: 500,
            color: tokens.colorFg,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <LinkIcon size={14} color={tokens.colorPrimary500} />
          <span>{label}</span>
          <Badge size="sm" variant="primary">
            {card} ➔ {targetMoul}
          </Badge>
          {required && <span style={{ color: tokens.colorError500 }}>*</span>}
        </label>
      </div>
      <Select
        aria-label={`${label} (${card} ➔ ${targetMoul})`}
        placeholder={isLoading ? 'Loading target records...' : `Select ${targetMoul} record...`}
        selectedKey={currentVal}
        onSelectionChange={(key) => onChange(key === '__none__' ? '' : String(key))}
        isRequired={required}
      >
        <SelectItem id="__none__" textValue="(None / Clear)">
          <em>(None / Clear)</em>
        </SelectItem>
        {targetRecords.map((rec) => (
          <SelectItem key={rec.id} id={rec.id} textValue={getRecordDisplayLabel(rec)}>
            {getRecordDisplayLabel(rec)} ({rec.id})
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}

function RecordsPage() {
  const { moulName } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const [activeRecord, setActiveRecord] = useState<any | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [searchVal, setSearchVal] = useState(search.search || '');

  // Copy feedback states
  const [copiedId, setCopiedId] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedError, setCopiedError] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  React.useEffect(() => {
    setSearchVal(search.search || '');
  }, [search.search]);

  React.useEffect(() => {
    if (search.create) {
      handleOpenCreate();
    }
  }, [search.create]);

  // 1. Fetch collection schema to get field definitions
  const { data: moul } = useQuery({
    queryKey: ['moul', moulName],
    queryFn: () => api.getMoul(moulName),
  });

  // Collect all relation field names to pass as expand query param
  const relationExpandQuery = useMemo(() => {
    if (!moul?.fields) return undefined;
    const relFields = moul.fields
      .filter((f: any) => f.type === 'relation' && f.name)
      .map((f: any) => f.name);
    return relFields.length > 0 ? relFields.join(',') : undefined;
  }, [moul]);

  // 2. Fetch records list with relation expansions
  const { data: recordsData, isLoading } = useQuery({
    queryKey: [
      'records',
      moulName,
      search.page,
      search.perPage,
      search.sort,
      search.filter,
      search.search,
      relationExpandQuery,
    ],
    queryFn: () =>
      api.listRecords(moulName, {
        page: search.page,
        perPage: search.perPage,
        sort: search.sort,
        filter: search.filter,
        search: search.search,
        expand: relationExpandQuery,
      }),
  });

  const records = useMemo(() => {
    if (Array.isArray(recordsData)) return recordsData;
    if (recordsData && Array.isArray(recordsData.items)) return recordsData.items;
    return [];
  }, [recordsData]);

  const totalItems =
    recordsData && !Array.isArray(recordsData) && typeof recordsData.totalItems === 'number'
      ? recordsData.totalItems
      : records.length;

  const totalPages =
    recordsData && !Array.isArray(recordsData) && typeof (recordsData as any).totalPages === 'number'
      ? Math.max(1, (recordsData as any).totalPages)
      : 1;
  const currentPage = search.page || 1;

  // Schema field keys with filtering and inference
  const displayFields = useMemo(() => {
    const isAuth = moul?.type === 'auth';
    const isWorker = moul?.type === 'worker';

    if (moul?.fields && moul.fields.length > 0) {
      return moul.fields.filter((f: any) => {
        if (isAuth && (f.name === 'username' || f.name === 'email')) return false;
        if (isWorker && (f.name === 'worker' || f.name === 'state' || f.name === 'queue' || f.name === 'attempt')) return false;
        return true;
      });
    }

    if (records.length > 0) {
      const ignoredKeys = new Set([
        'id',
        'created_at',
        'updated_at',
        'username',
        'email',
        'passwordHash',
        'otpCode',
        'otpExpiresAt',
        'passkeys',
        'resetToken',
        'resetTokenExpiresAt',
        'oauthProviders',
        'worker',
        'state',
        'queue',
        'attempt',
        'max_attempts',
        'priority',
        'inserted_at',
        'scheduled_at',
        'attempted_at',
        'attempted_by',
        'completed_at',
        'discarded_at',
        'cancelled_at',
        'errors',
        'last_error',
        'tags',
        'meta',
        'args',
        'expand',
      ]);

      const inferredKeys = new Set<string>();
      for (const rec of records) {
        Object.keys(rec).forEach((k) => {
          if (!ignoredKeys.has(k)) {
            inferredKeys.add(k);
          }
        });
      }

      return Array.from(inferredKeys).map((name) => ({ name, type: 'text' }));
    }

    return [];
  }, [moul, records]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.createRecord(moulName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      setIsDrawerOpen(false);
      toastQueue.add({
        title: 'Record Created',
        description: 'New record created successfully.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Creation Failed',
        description: err.message || 'Failed to create record.',
        variant: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateRecord(moulName, id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      setIsDrawerOpen(false);
      toastQueue.add({
        title: 'Record Updated',
        description: 'Record updated successfully.',
        variant: 'success',
      });
      if (updated && activeRecord?.id === updated.id) {
        setActiveRecord(updated);
      }
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Update Failed',
        description: err.message || 'Failed to update record.',
        variant: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteRecord(moulName, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      setIsDrawerOpen(false);
      toastQueue.add({
        title: 'Record Deleted',
        description: 'Record was deleted.',
        variant: 'info',
      });
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Delete Failed',
        description: err.message || 'Failed to delete record.',
        variant: 'error',
      });
    },
  });

  // Worker task retry mutation
  const retryTaskMutation = useMutation({
    mutationFn: async (record: any) => {
      try {
        return await api.retryJobs(moulName, [record.id]);
      } catch {
        return await api.updateRecord(moulName, record.id, {
          state: 'available',
          scheduled_at: new Date().toISOString(),
          attempt: 0,
        });
      }
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      queryClient.invalidateQueries({ queryKey: ['workerJobs'] });
      toastQueue.add({
        title: 'Task Scheduled for Retry',
        description: `Worker task ${record.id} marked as available for immediate execution.`,
        variant: 'success',
      });
      if (activeRecord?.id === record.id) {
        const updated = {
          ...activeRecord,
          state: 'available',
          attempt: 0,
          scheduled_at: new Date().toISOString(),
        };
        setActiveRecord(updated);
        setFormData(updated);
      }
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Retry Failed',
        description: err.message || 'Failed to retry worker task.',
        variant: 'error',
      });
    },
  });

  // Worker task discard mutation
  const discardTaskMutation = useMutation({
    mutationFn: (record: any) =>
      api.updateRecord(moulName, record.id, {
        state: 'discarded',
        discarded_at: new Date().toISOString(),
      }),
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      queryClient.invalidateQueries({ queryKey: ['workerJobs'] });
      toastQueue.add({
        title: 'Task Discarded',
        description: `Worker task ${record.id} was marked as discarded.`,
        variant: 'info',
      });
      if (activeRecord?.id === record.id) {
        const updated = {
          ...activeRecord,
          state: 'discarded',
          discarded_at: new Date().toISOString(),
        };
        setActiveRecord(updated);
        setFormData(updated);
      }
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Discard Failed',
        description: err.message || 'Failed to discard task.',
        variant: 'error',
      });
    },
  });

  const handleOpenCreate = () => {
    setFormData({});
    setIsCreating(true);
    setActiveRecord(null);
    setShowRawJson(false);
    setIsDrawerOpen(true);
  };

  const handleOpenDetail = (rec: any) => {
    setFormData({ ...rec });
    setIsCreating(false);
    setActiveRecord(rec);
    setShowRawJson(false);
    setIsDrawerOpen(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) {
      createMutation.mutate(formData);
    } else if (activeRecord) {
      updateMutation.mutate({ id: activeRecord.id, data: formData });
    }
  };

  const handleSearchSubmit = (query: string) => {
    navigate({
      search: (prev: any) => ({
        ...prev,
        page: 1,
        search: query.trim() || undefined,
      }),
    });
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyJson = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyError = (err: string) => {
    navigator.clipboard.writeText(err);
    setCopiedError(true);
    setTimeout(() => setCopiedError(false), 2000);
  };

  // Helper for error string extraction on worker tasks
  const workerErrors = useMemo(() => {
    if (!activeRecord) return null;
    if (Array.isArray(activeRecord.errors) && activeRecord.errors.length > 0) {
      return activeRecord.errors.join('\n');
    }
    if (activeRecord.last_error) {
      return String(activeRecord.last_error);
    }
    return null;
  }, [activeRecord]);

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>
            <DatabaseIcon size={24} color={tokens.colorPrimary500} />
            <span>{moulName} Records</span>
            <Badge variant="primary">{moul?.type || 'base'}</Badge>
          </h1>
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
            Explore records data grid, click any Record ID to view and modify details, or retry worker tasks.
          </span>
        </div>
        <Button variant="primary" onPress={handleOpenCreate}>
          <PlusIcon size={16} />
          <span>New Record</span>
        </Button>
      </div>

      {/* Toolbar */}
      <Card variant="glass">
        <CardBody>
          <div {...stylex.props(styles.toolbar)}>
            <div {...stylex.props(styles.searchBox)}>
              <SearchField
                aria-label="Search records"
                placeholder="Search records..."
                value={searchVal}
                onChange={setSearchVal}
                onSubmit={handleSearchSubmit}
              />
            </div>
            <span style={{ fontSize: tokens.fontSizeSm, color: tokens.colorFgSubtle }}>
              Showing {records.length} of {totalItems} record{totalItems !== 1 ? 's' : ''}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Moul UI Table */}
      <Table aria-label={`${moulName} records table`} dense stickyHeader hoverable>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            {moul?.type === 'auth' && (
              <>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
              </>
            )}
            {moul?.type === 'worker' && (
              <>
                <TableHead>Worker</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Queue</TableHead>
                <TableHead align="numeric">Attempt</TableHead>
              </>
            )}
            {displayFields.map((f: any) => (
              <TableHead key={f.name}>{f.name}</TableHead>
            ))}
            <TableHead>Created At</TableHead>
            <TableHead align="right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton
              rows={6}
              columns={1 + (moul?.type === 'auth' ? 2 : 0) + (moul?.type === 'worker' ? 4 : 0) + displayFields.length + 2}
            />
          ) : records.length === 0 ? (
            <TableEmpty colSpan={1 + (moul?.type === 'auth' ? 2 : 0) + (moul?.type === 'worker' ? 4 : 0) + displayFields.length + 2}>
              <EmptyState
                variant="default"
                title="No records found"
                description={
                  search.search?.trim()
                    ? `No records matching "${search.search}".`
                    : `No data records in "${moulName}". Click "New Record" to insert one.`
                }
                action={
                  <Button size="sm" variant="primary" onPress={handleOpenCreate}>
                    <PlusIcon size={14} />
                    <span>New Record</span>
                  </Button>
                }
              />
            </TableEmpty>
          ) : (
            records.map((rec: any) => {
              const workerState = String(rec.state || 'available').toLowerCase();
              const canRetry =
                moul?.type === 'worker' &&
                (workerState === 'failed' ||
                  workerState === 'discarded' ||
                  workerState === 'retryable' ||
                  workerState === 'completed');

              return (
                <TableRow key={rec.id}>
                  <TableCell>
                    <button
                      type="button"
                      {...stylex.props(styles.recordIdBtn)}
                      onClick={() => handleOpenDetail(rec)}
                      title={`Click to view and edit record #${rec.id}`}
                    >
                      <span>{String(rec.id)}</span>
                    </button>
                  </TableCell>
                  {moul?.type === 'auth' && (
                    <>
                      <TableCell>{rec.username || '-'}</TableCell>
                      <TableCell>{rec.email || '-'}</TableCell>
                    </>
                  )}
                  {moul?.type === 'worker' && (
                    <>
                      <TableCell>
                        <span style={{ fontWeight: 600 }}>{rec.worker || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getWorkerStatusVariant(rec.state)} size="sm">
                          {rec.state || 'available'}
                        </Badge>
                      </TableCell>
                      <TableCell>{rec.queue || 'default'}</TableCell>
                      <TableCell align="numeric" tabular>
                        <span
                          style={{
                            color:
                              (rec.attempt ?? 0) >= (rec.max_attempts ?? 3)
                                ? tokens.colorError500
                                : tokens.colorFgSubtle,
                          }}
                        >
                          {rec.attempt ?? 0}/{rec.max_attempts ?? 3}
                        </span>
                      </TableCell>
                    </>
                  )}
                  {displayFields.map((f: any) => {
                    const val = rec[f.name];

                    // 1. File Field Rendering
                    if (f.type === 'file') {
                      if (!val) {
                        return (
                          <TableCell key={f.name}>
                            <span style={{ color: tokens.colorFgSubtle }}>-</span>
                          </TableCell>
                        );
                      }
                      const url = getFileUrl(val);
                      const filename = getFileName(val);
                      const isImg = isImageFile(val);

                      return (
                        <TableCell key={f.name}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isImg && url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer noopener"
                                style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
                                title={`View ${filename}`}
                              >
                                <img
                                  src={url}
                                  alt={filename}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    border: `1px solid ${tokens.colorBorderSubtle}`,
                                    boxShadow: tokens.shadowSm,
                                  }}
                                />
                              </a>
                            ) : (
                              <FileIcon size={18} color={tokens.colorPrimary500} />
                            )}
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer noopener"
                                style={{
                                  color: tokens.colorPrimary500,
                                  textDecoration: 'none',
                                  fontSize: tokens.fontSizeXs,
                                  maxWidth: '140px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                }}
                                title={filename}
                              >
                                <span>{filename}</span>
                                <ArrowSquareOutIcon size={11} />
                              </a>
                            ) : (
                              <span style={{ fontSize: tokens.fontSizeXs }}>{filename}</span>
                            )}
                          </div>
                        </TableCell>
                      );
                    }

                    // 2. Relation Field Rendering
                    if (f.type === 'relation') {
                      const targetMoul = f.relationConfig?.targetMoul || '';
                      const card = f.relationConfig?.cardinality || '1:N';
                      const expanded = rec.expand?.[f.name];

                      if (!val || (Array.isArray(val) && val.length === 0)) {
                        return (
                          <TableCell key={f.name}>
                            <span style={{ color: tokens.colorFgSubtle }}>-</span>
                          </TableCell>
                        );
                      }

                      if (card === 'M:N') {
                        const ids: string[] = Array.isArray(val) ? val : [String(val)];
                        const expandedList: any[] = Array.isArray(expanded) ? expanded : [];

                        return (
                          <TableCell key={f.name}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                              {ids.map((id, i) => {
                                const expItem = expandedList.find((e) => String(e.id) === String(id)) || expandedList[i];
                                const label = expItem ? getRecordDisplayLabel(expItem) : id;
                                return (
                                  <span
                                    key={id || i}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      backgroundColor: tokens.colorBgElevated,
                                      border: `1px solid ${tokens.colorPrimary500}`,
                                      borderRadius: tokens.radiusSm,
                                      padding: '2px 6px',
                                      fontSize: tokens.fontSizeXs,
                                      color: tokens.colorFg,
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                      window.open(`/records/${targetMoul}?search=${encodeURIComponent(id)}`, '_blank');
                                    }}
                                    title={`Target: ${targetMoul} · ID: ${id}`}
                                  >
                                    <LinkIcon size={12} color={tokens.colorPrimary500} />
                                    <span>{label}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </TableCell>
                        );
                      }

                      // 1:1 or 1:N
                      const id = String(val);
                      const label = expanded ? getRecordDisplayLabel(expanded) : id;

                      return (
                        <TableCell key={f.name}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: tokens.colorBgElevated,
                              border: `1px solid ${tokens.colorPrimary500}`,
                              borderRadius: tokens.radiusSm,
                              padding: '2px 6px',
                              fontSize: tokens.fontSizeXs,
                              color: tokens.colorFg,
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              window.open(`/records/${targetMoul}?search=${encodeURIComponent(id)}`, '_blank');
                            }}
                            title={`Target: ${targetMoul} · ID: ${id}`}
                          >
                            <LinkIcon size={12} color={tokens.colorPrimary500} />
                            <span>{label}</span>
                          </span>
                        </TableCell>
                      );
                    }

                    // 3. Default Cell Rendering
                    return (
                      <TableCell key={f.name}>
                        {val === null || val === undefined ? (
                          <span style={{ color: tokens.colorFgSubtle }}>-</span>
                        ) : typeof val === 'boolean' ? (
                          <Badge variant={val ? 'success' : 'error'}>{val ? 'true' : 'false'}</Badge>
                        ) : typeof val === 'object' ? (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: tokens.fontSizeXs }}>
                            {JSON.stringify(val)}
                          </span>
                        ) : (
                          String(val)
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <span style={{ fontSize: tokens.fontSizeXs, color: tokens.colorFgSubtle }}>
                      {rec.created_at || rec.inserted_at ? new Date(String(rec.created_at || rec.inserted_at)).toLocaleString() : '-'}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {canRetry && (
                        <Button
                          size="sm"
                          variant="secondary"
                          aria-label={`Retry task ${rec.id}`}
                          isPending={retryTaskMutation.isPending && retryTaskMutation.variables?.id === rec.id}
                          onPress={() => retryTaskMutation.mutate(rec)}
                        >
                          <ArrowsCounterClockwiseIcon size={14} />
                          <span>Retry</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`View and edit record ${rec.id}`}
                        onPress={() => handleOpenDetail(rec)}
                      >
                        <PencilSimpleIcon size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Delete record ${rec.id}`}
                        onPress={() => setRecordToDelete(rec)}
                      >
                        <TrashIcon size={14} color={tokens.colorError500} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div {...stylex.props(styles.pagination)}>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div {...stylex.props(styles.paginationButtons)}>
          <Button
            size="sm"
            variant="secondary"
            isDisabled={currentPage <= 1}
            onPress={() =>
              navigate({
                search: (prev: any) => ({
                  ...prev,
                  page: Math.max(1, currentPage - 1),
                }),
              })
            }
          >
            <CaretLeftIcon size={14} />
            <span>Previous</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            isDisabled={currentPage >= totalPages}
            onPress={() =>
              navigate({
                search: (prev: any) => ({
                  ...prev,
                  page: currentPage + 1,
                }),
              })
            }
          >
            <span>Next</span>
            <CaretRightIcon size={14} />
          </Button>
        </div>
      </div>

      {/* Record Detail & Modification Drawer */}
      <DrawerOverlay isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} isDismissable>
        <Drawer placement="right" size="lg">
          <DrawerDialog>
            <form
              onSubmit={handleSaveRecord}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
            >
              <DrawerHeader>
                <DrawerTitle>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2, flexWrap: 'wrap' }}>
                    <span>{isCreating ? `Create ${moulName} Record` : `Record #${activeRecord?.id}`}</span>
                    <Badge variant="primary">{moul?.type || 'base'}</Badge>
                    {!isCreating && activeRecord?.state && (
                      <Badge variant={getWorkerStatusVariant(activeRecord.state)} size="sm">
                        {activeRecord.state}
                      </Badge>
                    )}
                    {!isCreating && activeRecord?.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Copy record ID"
                        onPress={() => handleCopyId(String(activeRecord.id))}
                      >
                        {copiedId ? <CheckIcon size={13} color={tokens.colorSuccess500} /> : <CopyIcon size={13} />}
                        <span style={{ fontSize: tokens.fontSizeXs }}>{copiedId ? 'Copied' : 'Copy ID'}</span>
                      </Button>
                    )}
                  </div>
                </DrawerTitle>
                <DrawerCloseButton />
              </DrawerHeader>

              <DrawerBody>
                <div {...stylex.props(styles.drawerForm)}>
                  {/* WORKER TASK INSPECTOR & ACTIONS (When Collection is Worker and Not Creating) */}
                  {moul?.type === 'worker' && !isCreating && activeRecord && (
                    <div {...stylex.props(styles.workerInspector)}>
                      <div {...stylex.props(styles.workerHeader)}>
                        <span {...stylex.props(styles.workerTitle)}>
                          <ClockIcon size={16} color={tokens.colorPrimary500} />
                          <span>Worker Task Inspector</span>
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing1 }}>
                          <Button
                            size="sm"
                            variant="secondary"
                            aria-label="Retry task immediately"
                            isPending={retryTaskMutation.isPending}
                            onPress={() => retryTaskMutation.mutate(activeRecord)}
                          >
                            <ArrowsCounterClockwiseIcon size={14} />
                            <span>Retry Task</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="danger-soft"
                            aria-label="Discard task"
                            isDisabled={activeRecord.state === 'discarded'}
                            isPending={discardTaskMutation.isPending}
                            onPress={() => discardTaskMutation.mutate(activeRecord)}
                          >
                            <ProhibitIcon size={14} />
                            <span>Discard</span>
                          </Button>
                        </div>
                      </div>

                      {/* Worker Statistics Grid */}
                      <div {...stylex.props(styles.workerGrid)}>
                        <div {...stylex.props(styles.workerStatCard)}>
                          <span {...stylex.props(styles.statLabel)}>Handler</span>
                          <span {...stylex.props(styles.statVal)} title={activeRecord.worker || 'anonymous'}>
                            {activeRecord.worker || 'anonymous'}
                          </span>
                        </div>
                        <div {...stylex.props(styles.workerStatCard)}>
                          <span {...stylex.props(styles.statLabel)}>Queue</span>
                          <span {...stylex.props(styles.statVal)}>{activeRecord.queue || 'default'}</span>
                        </div>
                        <div {...stylex.props(styles.workerStatCard)}>
                          <span {...stylex.props(styles.statLabel)}>Attempts</span>
                          <span
                            {...stylex.props(styles.statVal)}
                            style={{
                              color:
                                (activeRecord.attempt ?? 0) >= (activeRecord.max_attempts ?? 3)
                                  ? tokens.colorError500
                                  : tokens.colorFg,
                            }}
                          >
                            {activeRecord.attempt ?? 0} / {activeRecord.max_attempts ?? 3}
                          </span>
                        </div>
                        <div {...stylex.props(styles.workerStatCard)}>
                          <span {...stylex.props(styles.statLabel)}>Priority</span>
                          <span {...stylex.props(styles.statVal)}>{activeRecord.priority ?? 0}</span>
                        </div>
                      </div>

                      {/* Error Trace Display if task failed or has errors */}
                      {workerErrors && (
                        <div {...stylex.props(styles.errorTraceBox)}>
                          <div {...stylex.props(styles.errorTraceHeader)}>
                            <span {...stylex.props(styles.errorTraceTitle)}>
                              <WarningCircleIcon size={15} />
                              <span>Error Trace</span>
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              aria-label="Copy error trace"
                              onPress={() => handleCopyError(workerErrors)}
                            >
                              {copiedError ? (
                                <CheckIcon size={12} color={tokens.colorSuccess500} />
                              ) : (
                                <CopyIcon size={12} />
                              )}
                              <span style={{ fontSize: '0.75rem' }}>{copiedError ? 'Copied' : 'Copy'}</span>
                            </Button>
                          </div>
                          <pre {...stylex.props(styles.errorTraceContent)}>{workerErrors}</pre>
                        </div>
                      )}

                      {/* Worker Arguments (Payload) JSON Field */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <label style={{ fontSize: tokens.fontSizeSm, fontWeight: 500, color: tokens.colorFg }}>
                            Task Payload / Arguments (args)
                          </label>
                          <span style={{ fontSize: tokens.fontSizeXs, color: tokens.colorFgSubtle }}>
                            JSON Payload
                          </span>
                        </div>
                        <TextArea
                          aria-label="Task Payload Arguments"
                          placeholder="{}"
                          value={
                            typeof formData.args === 'object' && formData.args !== null
                              ? JSON.stringify(formData.args, null, 2)
                              : String(formData.args ?? '')
                          }
                          onChange={(val) => {
                            try {
                              const parsed = JSON.parse(val);
                              setFormData({ ...formData, args: parsed });
                            } catch {
                              setFormData({ ...formData, args: val });
                            }
                          }}
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {/* Section Title for Form Fields */}
                  <div {...stylex.props(styles.sectionTitle)}>
                    <ListBulletsIcon size={16} color={tokens.colorPrimary500} />
                    <span>{isCreating ? 'New Record Attributes' : 'Editable Record Attributes'}</span>
                  </div>

                  {/* Auth Fields */}
                  {moul?.type === 'auth' && (
                    <>
                      <TextField
                        label="Username"
                        value={formData.username || ''}
                        onChange={(val) => setFormData({ ...formData, username: val })}
                        isRequired={isCreating}
                      />
                      <TextField
                        label="Email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(val) => setFormData({ ...formData, email: val })}
                        isRequired={isCreating}
                      />
                      {isCreating && (
                        <>
                          <TextField
                            label="Password"
                            type="password"
                            value={formData.password || ''}
                            onChange={(val) => setFormData({ ...formData, password: val })}
                            isRequired
                          />
                          <TextField
                            label="Confirm Password"
                            type="password"
                            value={formData.passwordConfirm || ''}
                            onChange={(val) => setFormData({ ...formData, passwordConfirm: val })}
                            isRequired
                          />
                        </>
                      )}
                    </>
                  )}

                  {/* Schema Display Fields */}
                  {displayFields.map((f: any) => (
                    <div key={f.name}>
                      {f.type === 'bool' ? (
                        <Checkbox
                          isSelected={Boolean(formData[f.name])}
                          onChange={(checked) => setFormData({ ...formData, [f.name]: checked })}
                        >
                          {f.name}
                        </Checkbox>
                      ) : f.type === 'file' ? (
                        <FileFieldInput
                          label={f.name}
                          required={Boolean(f.required)}
                          value={formData[f.name]}
                          onChange={(val) => setFormData({ ...formData, [f.name]: val })}
                        />
                      ) : f.type === 'relation' ? (
                        <RelationFieldInput
                          label={f.name}
                          required={Boolean(f.required)}
                          relationConfig={f.relationConfig}
                          value={formData[f.name]}
                          onChange={(val) => setFormData({ ...formData, [f.name]: val })}
                        />
                      ) : f.type === 'select' && f.options && f.options.length > 0 ? (
                        <Select
                          label={f.name}
                          placeholder={`Select ${f.name}`}
                          selectedKey={formData[f.name] || ''}
                          onSelectionChange={(key) => setFormData({ ...formData, [f.name]: String(key) })}
                          isRequired={Boolean(f.required)}
                        >
                          {f.options.map((opt: string) => (
                            <SelectItem key={opt} id={opt} textValue={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </Select>
                      ) : f.type === 'json' ? (
                        <TextArea
                          label={f.name}
                          placeholder='{"key": "value"}'
                          value={
                            typeof formData[f.name] === 'object' && formData[f.name] !== null
                              ? JSON.stringify(formData[f.name], null, 2)
                              : String(formData[f.name] ?? '')
                          }
                          onChange={(val) => {
                            try {
                              const parsed = JSON.parse(val);
                              setFormData({ ...formData, [f.name]: parsed });
                            } catch {
                              setFormData({ ...formData, [f.name]: val });
                            }
                          }}
                          rows={4}
                          isRequired={Boolean(f.required)}
                        />
                      ) : (
                        <TextField
                          label={f.name}
                          type={
                            f.type === 'number'
                              ? 'number'
                              : f.type === 'date'
                                ? 'date'
                                : f.type === 'datetime'
                                  ? 'datetime-local'
                                  : f.type === 'url'
                                    ? 'url'
                                    : 'text'
                          }
                          value={String(formData[f.name] ?? '')}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              [f.name]: f.type === 'number' ? Number(val) : val,
                            })
                          }
                          isRequired={Boolean(f.required)}
                        />
                      )}
                    </div>
                  ))}

                  {/* SYSTEM METADATA & RAW JSON VIEWER (When Editing) */}
                  {!isCreating && activeRecord && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing2, marginTop: tokens.spacing2 }}>
                      <div {...stylex.props(styles.sectionTitle)}>
                        <InfoIcon size={16} color={tokens.colorPrimary500} />
                        <span>System Metadata & Inspection</span>
                      </div>

                      <div {...stylex.props(styles.metadataCard)}>
                        <div {...stylex.props(styles.metadataRow)}>
                          <span>Record ID:</span>
                          <span style={{ color: tokens.colorFg, fontWeight: 600 }}>{activeRecord.id}</span>
                        </div>
                        {activeRecord.created_at && (
                          <div {...stylex.props(styles.metadataRow)}>
                            <span>Created At:</span>
                            <span style={{ color: tokens.colorFg }}>{new Date(activeRecord.created_at).toLocaleString()}</span>
                          </div>
                        )}
                        {activeRecord.inserted_at && (
                          <div {...stylex.props(styles.metadataRow)}>
                            <span>Inserted At:</span>
                            <span style={{ color: tokens.colorFg }}>{new Date(activeRecord.inserted_at).toLocaleString()}</span>
                          </div>
                        )}
                        {activeRecord.updated_at && (
                          <div {...stylex.props(styles.metadataRow)}>
                            <span>Updated At:</span>
                            <span style={{ color: tokens.colorFg }}>{new Date(activeRecord.updated_at).toLocaleString()}</span>
                          </div>
                        )}
                        {activeRecord.scheduled_at && (
                          <div {...stylex.props(styles.metadataRow)}>
                            <span>Scheduled At:</span>
                            <span style={{ color: tokens.colorFg }}>{new Date(activeRecord.scheduled_at).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => setShowRawJson(!showRawJson)}
                        >
                          <CodeIcon size={14} />
                          <span>{showRawJson ? 'Hide Raw JSON' : 'Inspect Raw JSON'}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Copy full record JSON"
                          onPress={() => handleCopyJson(activeRecord)}
                        >
                          {copiedJson ? <CheckIcon size={13} color={tokens.colorSuccess500} /> : <CopyIcon size={13} />}
                          <span style={{ fontSize: tokens.fontSizeXs }}>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                        </Button>
                      </div>

                      {showRawJson && (
                        <pre {...stylex.props(styles.jsonBlock)}>
                          {JSON.stringify(activeRecord, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </DrawerBody>

              <DrawerFooter>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    {!isCreating && activeRecord && (
                      <Button
                        type="button"
                        variant="danger-soft"
                        onPress={() => setRecordToDelete(activeRecord)}
                      >
                        <TrashIcon size={14} />
                        <span>Delete</span>
                      </Button>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2 }}>
                    <Button type="button" variant="ghost" onPress={() => setIsDrawerOpen(false)}>
                      Cancel
                    </Button>
                    {!isCreating && moul?.type === 'worker' && activeRecord && (
                      <Button
                        type="button"
                        variant="secondary"
                        isPending={retryTaskMutation.isPending}
                        onPress={() => retryTaskMutation.mutate(activeRecord)}
                      >
                        <ArrowsCounterClockwiseIcon size={14} />
                        <span>Retry Task</span>
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      isDisabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? 'Saving...'
                        : isCreating
                          ? 'Create Record'
                          : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </DrawerFooter>
            </form>
          </DrawerDialog>
        </Drawer>
      </DrawerOverlay>

      {/* CONFIRM DELETE RECORD ALERT DIALOG */}
      <ModalOverlay
        isOpen={recordToDelete !== null}
        onOpenChange={(open: boolean) => !open && setRecordToDelete(null)}
        isDismissable
      >
        <Modal size="sm">
          <AlertDialog>
            <AlertDialogHeader>
              <h3 style={{ margin: 0, fontSize: tokens.fontSizeLg, fontWeight: 600, color: tokens.colorFg }}>
                Delete Record
              </h3>
            </AlertDialogHeader>
            <AlertDialogBody>
              <p style={{ margin: 0, color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
                Are you sure you want to delete record <strong>&ldquo;{recordToDelete?.id}&rdquo;</strong>?
                <br />
                <br />
                This action cannot be undone.
              </p>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button variant="outline" onPress={() => setRecordToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isPending={deleteMutation.isPending}
                onPress={() => {
                  if (recordToDelete) {
                    deleteMutation.mutate(recordToDelete.id, {
                      onSettled: () => setRecordToDelete(null),
                    });
                  }
                }}
              >
                Delete Record
              </Button>
            </AlertDialogFooter>
          </AlertDialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
