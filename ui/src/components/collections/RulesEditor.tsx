import React, { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  Button,
  TextField,
  Card,
  CardHeader,
  CardBody,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import {
  LockKeyIcon,
  BookOpenIcon,
  ShieldCheckIcon,
} from '@phosphor-icons/react';
import { RuleDocsModal } from './RuleDocsModal';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing4,
    width: '100%',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacing2,
  },
  titleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  title: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 600,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
    margin: 0,
  },
  subtitle: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
  },
  presetsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
  },
  presetButtonsRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacing2,
  },
  rulesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
  },
});

export interface MoulRules {
  listRule?: string;
  viewRule?: string;
  createRule?: string;
  updateRule?: string;
  deleteRule?: string;
}

export interface RulesEditorProps {
  rules: MoulRules;
  onChange: (updatedRules: MoulRules) => void;
  collectionFields?: Array<{ name: string; type?: string }>;
  allCollections?: Array<{ name: string; fields?: Array<{ name: string }> }>;
  isAuthCollection?: boolean;
}

export function RulesEditor({
  rules,
  onChange,
  isAuthCollection = false,
}: RulesEditorProps) {
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const handleRuleChange = (key: keyof MoulRules, val: string) => {
    onChange({
      ...rules,
      [key]: val,
    });
  };

  const applyPresetToAll = (presetType: 'public' | 'auth' | 'owner' | 'admin') => {
    switch (presetType) {
      case 'public':
        onChange({
          listRule: '',
          viewRule: '',
          createRule: '',
          updateRule: '',
          deleteRule: '',
        });
        break;
      case 'auth':
        onChange({
          listRule: '@request.auth.id != ""',
          viewRule: '@request.auth.id != ""',
          createRule: '@request.auth.id != ""',
          updateRule: '@request.auth.id != ""',
          deleteRule: '@request.auth.id != ""',
        });
        break;
      case 'owner':
        if (isAuthCollection) {
          onChange({
            listRule: 'id = @request.auth.id',
            viewRule: 'id = @request.auth.id',
            createRule: '',
            updateRule: 'id = @request.auth.id',
            deleteRule: 'id = @request.auth.id',
          });
        } else {
          onChange({
            listRule: '',
            viewRule: '',
            createRule: '@request.auth.id != ""',
            updateRule: 'user_id = @request.auth.id',
            deleteRule: 'user_id = @request.auth.id',
          });
        }
        break;
      case 'admin':
        onChange({
          listRule: '@request.auth.role = "admin"',
          viewRule: '@request.auth.role = "admin"',
          createRule: '@request.auth.role = "admin"',
          updateRule: '@request.auth.role = "admin"',
          deleteRule: '@request.auth.role = "admin"',
        });
        break;
    }
  };

  return (
    <div {...stylex.props(styles.container)}>
      {/* Header with Docs Trigger */}
      <div {...stylex.props(styles.headerRow)}>
        <div {...stylex.props(styles.titleGroup)}>
          <h3 {...stylex.props(styles.title)}>
            <LockKeyIcon size={16} color={tokens.colorPrimary500} />
            <span>API Access Rules</span>
          </h3>
          <span {...stylex.props(styles.subtitle)}>
            Control read and write permissions. Leave empty for public access.
          </span>
        </div>

        <Button
          variant="outline"
          onPress={() => setIsDocsOpen(true)}
        >
          <BookOpenIcon size={16} />
          <span>Rule Reference & Examples</span>
        </Button>
      </div>

      {/* Global Presets using standard Button components */}
      <div {...stylex.props(styles.presetsSection)}>
        <div {...stylex.props(styles.presetButtonsRow)}>
          <Button
            variant="outline"
            onPress={() => applyPresetToAll('public')}
          >
            Public Access
          </Button>
          <Button
            variant="outline"
            onPress={() => applyPresetToAll('auth')}
          >
            Signed-In Users Only
          </Button>
          <Button
            variant="outline"
            onPress={() => applyPresetToAll('owner')}
          >
            Owner Managed
          </Button>
          <Button
            variant="outline"
            onPress={() => applyPresetToAll('admin')}
          >
            Admins Only
          </Button>
        </div>
      </div>

      {/* Standard Moul UI TextField inputs */}
      <div {...stylex.props(styles.rulesList)}>
        <TextField
          label="List Records (GET /records)"
          placeholder="e.g. status = 'published' || @request.auth.id != ''"
          value={rules.listRule || ''}
          onChange={(val) => handleRuleChange('listRule', val)}
          description="Governs query and list endpoints. Empty allows public access."
        />

        <TextField
          label="View Single Record (GET /records/:id)"
          placeholder="e.g. id = @request.auth.id"
          value={rules.viewRule || ''}
          onChange={(val) => handleRuleChange('viewRule', val)}
          description="Governs viewing a single record by ID. Empty allows public access."
        />

        <TextField
          label="Create Record (POST /records)"
          placeholder="e.g. @request.auth.id != ''"
          value={rules.createRule || ''}
          onChange={(val) => handleRuleChange('createRule', val)}
          description="Validates permissions before inserting a new record."
        />

        <TextField
          label="Update Record (PATCH /records/:id)"
          placeholder="e.g. user_id = @request.auth.id"
          value={rules.updateRule || ''}
          onChange={(val) => handleRuleChange('updateRule', val)}
          description="Validates permissions before updating an existing record."
        />

        <TextField
          label="Delete Record (DELETE /records/:id)"
          placeholder="e.g. user_id = @request.auth.id"
          value={rules.deleteRule || ''}
          onChange={(val) => handleRuleChange('deleteRule', val)}
          description="Validates permissions before deleting a record."
        />
      </div>

      {/* Shared Rule Docs Modal */}
      <RuleDocsModal
        isOpen={isDocsOpen}
        onOpenChange={setIsDocsOpen}
      />
    </div>
  );
}
