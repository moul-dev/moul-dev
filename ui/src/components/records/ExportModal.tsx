import React, { useState } from 'react';
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
  RadioGroup,
  Radio,
  Checkbox,
  Spinner,
  toastQueue,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import {
  DownloadSimpleIcon,
  FileCodeIcon,
  FileCsvIcon,
  FunnelIcon,
  DatabaseIcon,
} from '@phosphor-icons/react';
import { api } from '../../api/client';

export interface ExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  moulName: string;
  activeFilter?: string;
  activeSearch?: string;
  totalRecords?: number;
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
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
  },
  sectionLabel: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
  },
  formatGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacing3,
  },
  formatCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
    padding: tokens.spacing3,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    backgroundColor: tokens.colorBgElevated,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  formatCardSelected: {
    borderColor: tokens.colorPrimary500,
    backgroundColor: tokens.colorBgSubtle,
  },
  formatCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formatTitle: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 600,
    color: tokens.colorFg,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  formatDesc: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
    lineHeight: 1.4,
  },
  scopeBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
    padding: tokens.spacing3,
    backgroundColor: tokens.colorBgElevated,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
  },
  scopeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export function ExportModal({
  isOpen,
  onOpenChange,
  moulName,
  activeFilter,
  activeSearch,
  totalRecords = 0,
}: ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [scope, setScope] = useState<'all' | 'filtered'>(
    activeFilter || activeSearch ? 'filtered' : 'all'
  );
  const [includeSchema, setIncludeSchema] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const hasActiveFilters = Boolean(activeFilter?.trim() || activeSearch?.trim());

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await api.exportRecords(moulName, {
        format,
        includeSchema: format === 'json' ? includeSchema : false,
        filter: scope === 'filtered' ? activeFilter : undefined,
      });

      toastQueue.add({
        title: 'Export Successful',
        description: `Exported ${moulName} records as ${format.toUpperCase()}.`,
      });
      onOpenChange(false);
    } catch (err: any) {
      toastQueue.add({
        title: 'Export Failed',
        description: err.message || 'Failed to download exported records.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
      <Modal size="md">
        <ModalDialog aria-label={`Export ${moulName} records`}>
          <ModalHeader>
            <div {...stylex.props(styles.header)}>
              <h2 {...stylex.props(styles.headerTitle)}>
                <DownloadSimpleIcon size={20} color={tokens.colorPrimary500} />
                <span>Export Records - {moulName}</span>
              </h2>
            </div>
          </ModalHeader>

          <ModalBody>
            <div {...stylex.props(styles.content)}>
              {/* 1. Format Selection */}
              <div {...stylex.props(styles.section)}>
                <span {...stylex.props(styles.sectionLabel)}>Export Format</span>
                <div {...stylex.props(styles.formatGrid)}>
                  <div
                    {...stylex.props(
                      styles.formatCard,
                      format === 'json' && styles.formatCardSelected
                    )}
                    onClick={() => setFormat('json')}
                    role="button"
                    tabIndex={0}
                  >
                    <div {...stylex.props(styles.formatCardHeader)}>
                      <span {...stylex.props(styles.formatTitle)}>
                        <FileCodeIcon size={18} color={tokens.colorPrimary500} />
                        <span>JSON</span>
                      </span>
                      {format === 'json' && <Badge variant="primary">Selected</Badge>}
                    </div>
                    <span {...stylex.props(styles.formatDesc)}>
                      Structured JSON format. Ideal for migrations, backups, and nested relations.
                    </span>
                  </div>

                  <div
                    {...stylex.props(
                      styles.formatCard,
                      format === 'csv' && styles.formatCardSelected
                    )}
                    onClick={() => setFormat('csv')}
                    role="button"
                    tabIndex={0}
                  >
                    <div {...stylex.props(styles.formatCardHeader)}>
                      <span {...stylex.props(styles.formatTitle)}>
                        <FileCsvIcon size={18} color={tokens.colorPrimary500} />
                        <span>CSV</span>
                      </span>
                      {format === 'csv' && <Badge variant="primary">Selected</Badge>}
                    </div>
                    <span {...stylex.props(styles.formatDesc)}>
                      RFC 4180 spreadsheet format. Ideal for Excel, Google Sheets, or data analysts.
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Scope Selection */}
              <div {...stylex.props(styles.section)}>
                <span {...stylex.props(styles.sectionLabel)}>Export Scope</span>
                <div {...stylex.props(styles.scopeBox)}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="exportScope"
                      checked={scope === 'all'}
                      onChange={() => setScope('all')}
                    />
                    <DatabaseIcon size={16} />
                    <span style={{ fontSize: tokens.fontSizeSm }}>
                      All Records ({totalRecords} records in collection)
                    </span>
                  </label>

                  {hasActiveFilters && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="exportScope"
                        checked={scope === 'filtered'}
                        onChange={() => setScope('filtered')}
                      />
                      <FunnelIcon size={16} />
                      <span style={{ fontSize: tokens.fontSizeSm }}>
                        Active Filtered Subset
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* 3. JSON Options */}
              {format === 'json' && (
                <div {...stylex.props(styles.section)}>
                  <span {...stylex.props(styles.sectionLabel)}>Advanced Options</span>
                  <Checkbox
                    isSelected={includeSchema}
                    onChange={setIncludeSchema}
                  >
                    Include collection schema definition in export envelope
                  </Checkbox>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              onPress={() => onOpenChange(false)}
              isDisabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onPress={handleExport}
              isDisabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Spinner size="sm" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <DownloadSimpleIcon size={16} />
                  <span>Download {format.toUpperCase()}</span>
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </Modal>
    </ModalOverlay>
  );
}
