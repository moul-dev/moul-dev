import{i as e,l as t,n,o as r,r as i,t as a}from"./press-CVc8c9H4.js";import{i as o,n as s,t as c}from"./query-DdOx0cLf.js";import{t as l}from"./client-DaTS5Mxb.js";import{i as u,t as d}from"./router-B1wwybcr.js";import{Pn as f}from"./index-C29yRTIN.js";import"./data-table-BT-iosg4.js";import{n as p,t as m}from"./page-C5Uax4jB.js";import{n as h,t as g}from"./forms-ChSyHPkg.js";import{t as _}from"./toast-BKHbxuSD.js";var v={s3:{title:`Configure S3 Object Storage`,fields:[{key:`file_s3_enabled`,label:`Enable S3 Object Storage`,kind:`switch`},{key:`file_s3_bucket`,label:`S3 Bucket Name`,kind:`text`,placeholder:`e.g. my-app-bucket`,required:`file_s3_enabled`},{key:`file_s3_endpoint`,label:`S3 Endpoint URL`,kind:`text`,placeholder:`e.g. s3.amazonaws.com or https://<id>.r2.cloudflarestorage.com`,description:`Leave empty for standard AWS S3`},{key:`file_s3_region`,label:`S3 Region`,kind:`text`,placeholder:`e.g. us-east-1`},{key:`file_s3_access_key`,label:`S3 Access Key`,kind:`text`,placeholder:`e.g. AKIA...`},{key:`file_s3_secret_key`,label:`S3 Secret Key`,kind:`password`,placeholder:`••••••••`},{key:`file_s3_force_path_style`,label:`Force Path Style (Required for MinIO / Local emulators)`,kind:`switch`}]},litestream:{title:`Configure Litestream Backups`,fields:[{key:`litestream_enabled`,label:`Enable Litestream SQLite Continuous Replication`,kind:`switch`},{key:`litestream_s3_bucket`,label:`Backup S3 Bucket`,kind:`text`,placeholder:`e.g. my-sqlite-backups`,required:`litestream_enabled`},{key:`litestream_replica_path`,label:`Replica Destination Path`,kind:`text`,placeholder:`e.g. s3://my-sqlite-backups/prod-replica`},{key:`litestream_s3_endpoint`,label:`S3 Endpoint`,kind:`text`,placeholder:`e.g. s3.amazonaws.com`,description:`Leave empty for AWS S3 standard`},{key:`litestream_s3_region`,label:`S3 Region`,kind:`text`,placeholder:`e.g. us-east-1`},{key:`litestream_access_key_id`,label:`Access Key ID`,kind:`text`,placeholder:`e.g. AKIA...`},{key:`litestream_secret_access_key`,label:`Secret Access Key`,kind:`password`,placeholder:`••••••••`},{key:`litestream_s3_force_path_style`,label:`Force Path Style (MinIO)`,kind:`switch`}]},rootips:{title:`Configure Root User IP Whitelist`,fields:[{key:`root_user_ip_enabled`,label:`Enforce IP Restrictions on Root Logins`,kind:`switch`},{key:`root_user_allowed_ips`,label:`Allowed IP Addresses & Subnets`,kind:`textarea`,placeholder:`e.g. 127.0.0.1, 192.168.1.0/24, 10.0.0.0/8`,description:`Comma-separated list of valid IPv4, IPv6, and CIDR subnet notations.`}]},email:{title:`Configure Transactional Email`,fields:[{key:`email_enabled`,label:`Enable Transactional Email Delivery`,kind:`switch`},{key:`email_provider`,label:`Email Delivery Provider`,kind:`select`,fallback:`console`,options:[{key:`console`,label:`Console (Local Dev / Stdout)`},{key:`ses`,label:`Amazon SES`},{key:`resend`,label:`Resend`},{key:`mailgun`,label:`Mailgun`},{key:`sendgrid`,label:`SendGrid`},{key:`cloudflare`,label:`Cloudflare Email Workers`}]},{key:`email_from_address`,label:`From Address`,kind:`email`,placeholder:`noreply@example.com`,required:`email_enabled`},{key:`email_from_name`,label:`From Sender Name`,kind:`text`,placeholder:`e.g. Moul Engine`},{key:`email_api_key`,label:`API Key / AWS Access Key ID`,kind:`text`,placeholder:`API key or access key`},{key:`email_api_secret`,label:`API Secret / AWS Secret Key`,kind:`password`,placeholder:`••••••••`},{key:`email_domain`,label:`Domain / Account ID`,kind:`text`,placeholder:`Domain for Mailgun or Account ID for Cloudflare`},{key:`email_region`,label:`Region`,kind:`text`,placeholder:`e.g. us-east-1 or eu`},{key:`email_endpoint`,label:`Custom Endpoint / Cloudflare Worker URL`,kind:`text`,placeholder:`Optional custom endpoint or Cloudflare worker URL`}]},"oauth-global":{title:`Configure OAuth Callback URL`,fields:[{key:`oauth_redirect_url`,label:`Global OAuth Redirect URL`,kind:`text`,placeholder:`e.g. http://localhost:8090/api/oauth2/callback`,description:`The shared redirect callback URL configured across external OAuth applications.`,required:!0}]},"oauth-github":{title:`Configure GitHub OAuth2`,fields:[{key:`oauth_github_enabled`,label:`Enable GitHub OAuth2 Login`,kind:`switch`},{key:`oauth_github_client_id`,label:`GitHub Client ID`,kind:`text`,placeholder:`GitHub OAuth App Client ID`,required:`oauth_github_enabled`},{key:`oauth_github_client_secret`,label:`GitHub Client Secret`,kind:`password`,placeholder:`••••••••`,required:`oauth_github_enabled`}]},"oauth-google":{title:`Configure Google OAuth2`,fields:[{key:`oauth_google_enabled`,label:`Enable Google OAuth2 Login`,kind:`switch`},{key:`oauth_google_client_id`,label:`Google Client ID`,kind:`text`,placeholder:`Google Cloud Client ID`,required:`oauth_google_enabled`},{key:`oauth_google_client_secret`,label:`Google Client Secret`,kind:`password`,placeholder:`••••••••`,required:`oauth_google_enabled`}]},"oauth-apple":{title:`Configure Apple Sign-In`,fields:[{key:`oauth_apple_enabled`,label:`Enable Apple Sign-In`,kind:`switch`},{key:`oauth_apple_client_id`,label:`Apple Service / Client ID`,kind:`text`,placeholder:`e.g. com.example.app.service`,required:`oauth_apple_enabled`},{key:`oauth_apple_client_secret`,label:`Apple Client Secret (or Pre-signed JWT)`,kind:`password`,placeholder:`••••••••`},{key:`oauth_apple_team_id`,label:`Apple Team ID`,kind:`text`,placeholder:`e.g. DEF456GHIJ`},{key:`oauth_apple_key_id`,label:`Apple Key ID`,kind:`text`,placeholder:`e.g. ABC123DEFG`},{key:`oauth_apple_private_key`,label:`Apple Private Key (.p8)`,kind:`textarea`,placeholder:`-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----`}]}};function y(e,t){return e.required===!0||typeof e.required==`string`&&t[e.required]===`true`}function b(e,t){return e.fields.find(e=>y(e,t)&&!String(t[e.key]??``).trim())}function x(e,t){return Object.fromEntries(e.fields.map(e=>[e.key,t?.[e.key]||e.fallback||(e.kind===`switch`?`false`:``)]))}var S=[{key:`s3`,icon:`cloud`,label:`S3 Storage`},{key:`litestream`,icon:`floppy-disk`,label:`Litestream Backups`},{key:`ratelimit`,icon:`gauge`,label:`Rate Limiting`},{key:`rootips`,icon:`globe-hemisphere-west`,label:`Root User IPs`},{key:`email`,icon:`envelope-simple`,label:`Email Delivery`},{key:`oauth`,icon:`lock-key`,label:`OAuth2 Providers`},{key:`account`,icon:`user-gear`,label:`Root Account`}],C={"ratelimit-add":`Add Rate Limit Rule`,"ratelimit-edit":`Edit Rate Limit Rule`,account:`Edit Root User Account`,password:`Change Root Password`},w=[{key:`all`,label:`All Users (all)`},{key:`authenticated`,label:`Authenticated Only (authenticated)`},{key:`guest`,label:`Guests Only (guest)`}],T={label:``,maxRequests:60,interval:60,targetedUsers:`all`},E={currentPassword:``,newPassword:``,passwordConfirm:``};function D(e,t,n){return e?r`<moul-badge tone="success">${t}</moul-badge>`:r`<moul-badge variant="bordered">${n}</moul-badge>`}var O=class extends i{static styles=[n,p,t`
      moul-tabs::part(tablist) {
        overflow-x: auto;
        scrollbar-width: none;
      }

      .tab-label {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
        white-space: nowrap;
      }

      moul-tab-panel {
        padding-block: var(--spacing-2);
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-2);
        width: 100%;
      }

      .card-title {
        font-size: 1.125rem;
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
      }

      .intro {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-fg-subtle);
      }

      .grid-2,
      .grid-3 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
        gap: var(--spacing-4);
      }

      .grid-3 {
        grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
      }

      .info {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
      }

      .info-label {
        font-size: var(--font-size-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-fg-subtle);
      }

      .info-value {
        font-size: var(--font-size-sm);
        word-break: break-all;
      }

      .info-code {
        display: inline-block;
        padding: var(--spacing-1) var(--spacing-2);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-subtle);
        font-family: var(--font-mono);
        font-size: var(--font-size-sm);
      }

      .inline {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .provider-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-3);
      }

      .provider-name {
        font-size: var(--font-size-md);
        font-weight: 600;
      }

      .drawer-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
        width: 100%;
        font-size: 1rem;
        font-weight: 600;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
        padding-inline: var(--spacing-1);
        color: var(--color-fg);
      }

      .dialog-text {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-fg-subtle);
      }
    `];static properties={drawerMode:{state:!0},form:{state:!0},snapshot:{state:!0},editingRuleIndex:{state:!0},ruleToDelete:{state:!0},showDiscardDialog:{state:!0}};settings=new s(this,()=>({queryKey:[`settings`],queryFn:l.getSettings}));account=new s(this,()=>({queryKey:[`rootAccount`],queryFn:l.getRootAccount}));updateMutation=new c(this,{mutationFn:e=>l.updateSettings(e),onSuccess:()=>{o.invalidateQueries({queryKey:[`settings`]}),this.closeDrawer(),_.success(`Settings Saved`,`Engine configuration updated successfully.`)},onError:e=>_.error(`Save Failed`,e.message||`Failed to update settings.`)});accountMutation=new c(this,{mutationFn:e=>l.updateRootAccount(e),onSuccess:e=>{e.record&&f.updateUser({username:e.record.username,name:e.record.name,email:e.record.email}),e.token&&f.saveToken(e.token),o.invalidateQueries({queryKey:[`rootAccount`]}),this.closeDrawer(),_.success(`Account Updated`,`Root user account details updated successfully.`)},onError:e=>_.error(`Account Update Failed`,e.message||`Failed to update root user account.`)});passwordMutation=new c(this,{mutationFn:e=>l.updateRootPassword(e),onSuccess:()=>{this.closeDrawer(),_.success(`Password Updated`,`Root administrator password updated successfully.`)},onError:e=>_.error(`Password Update Failed`,e.message||`Failed to update root password.`)});constructor(){super(),this.drawerMode=null,this.form={},this.snapshot=``,this.editingRuleIndex=null,this.ruleToDelete=null,this.showDiscardDialog=!1,new u(this,d,f)}get tab(){let e=d.location.search.get(`tab`);return S.some(t=>t.key===e)?e:`s3`}scrolledToTab=``;async updated(){let e=this.tab,t=this.renderRoot.querySelector(`moul-tabs`);e!==this.scrolledToTab&&t&&(this.scrolledToTab=e,await t.updateComplete,this.renderRoot.querySelector(`moul-tab[key="${e}"]`)?.scrollIntoView({block:`nearest`,inline:`nearest`}))}get saved(){return this.settings.data}get rules(){try{let e=JSON.parse(this.saved?.rate_limiting_rules||`[]`);return Array.isArray(e)?e:[]}catch{return[]}}get isDirty(){return!!(this.drawerMode&&this.snapshot&&JSON.stringify(this.form)!==this.snapshot)}get isSaving(){return this.updateMutation.isPending||this.accountMutation.isPending||this.passwordMutation.isPending}openDrawer(e,t){let n;if(e===`account`){let e=this.account.data,t=f.user;n={username:e?.username||t?.username||``,name:e?.name||t?.name||``,email:e?.email||t?.email||``}}else n=e===`password`?{...E}:e===`ratelimit-add`?{...T}:e===`ratelimit-edit`?{...this.rules[t??-1]??T}:x(v[e],this.saved);this.editingRuleIndex=e===`ratelimit-edit`?t??null:null,this.form=n,this.snapshot=JSON.stringify(n),this.drawerMode=e}closeDrawer(){this.drawerMode=null,this.editingRuleIndex=null,this.snapshot=``}requestClose(){this.isDirty?this.showDiscardDialog=!0:this.closeDrawer()}onDrawerKeydown={capture:!0,handleEvent:e=>{e.key===`Escape`&&this.isDirty&&(e.preventDefault(),e.stopPropagation(),this.showDiscardDialog=!0)}};set(e,t){this.form={...this.form,[e]:t}}save(){let e=this.drawerMode;if(!e)return;let t=this.form;if(e===`ratelimit-add`||e===`ratelimit-edit`){if(!String(t.label).trim()){_.error(`Validation Error`,`Rate limit rule label is required.`);return}if(!(t.maxRequests>0)||!(t.interval>0)){_.error(`Validation Error`,`Max requests and interval must be greater than 0.`);return}let n={label:String(t.label).trim(),maxRequests:Number(t.maxRequests),interval:Number(t.interval),targetedUsers:t.targetedUsers},r=[...this.rules];e===`ratelimit-edit`&&this.editingRuleIndex!==null?r[this.editingRuleIndex]=n:r.push(n),this.updateMutation.mutate({rate_limiting_rules:JSON.stringify(r)});return}if(e===`account`){if(!String(t.username).trim()){_.error(`Validation Error`,`Username is required.`);return}this.accountMutation.mutate({username:t.username.trim(),name:t.name.trim(),email:t.email.trim()});return}if(e===`password`){if(!t.currentPassword){_.error(`Validation Error`,`Current password is required.`);return}if(!t.newPassword){_.error(`Validation Error`,`New password is required.`);return}if(t.newPassword!==t.passwordConfirm){_.error(`Validation Error`,`New password and confirmation do not match.`);return}this.passwordMutation.mutate({currentPassword:t.currentPassword,password:t.newPassword,passwordConfirm:t.passwordConfirm});return}let n=b(v[e],t);n?_.error(`Validation Error`,`${n.label} is required.`):this.updateMutation.mutate(t)}deleteRule(){let e=this.ruleToDelete;e&&(this.updateMutation.mutate({rate_limiting_rules:JSON.stringify(this.rules.filter((t,n)=>n!==e.index))}),this.ruleToDelete=null)}card(e,t,n,i,a=`var(--color-primary-500)`){return r`
      <moul-card>
        <moul-card-header>
          <div class="card-header">
            <span class="card-title">
              <admin-icon name=${e} size="20" color=${a}></admin-icon>
              ${t}
            </span>
            ${n}
          </div>
        </moul-card-header>
        <moul-card-body>${i}</moul-card-body>
      </moul-card>
    `}editButton(e,t,n=`pencil-simple`,i=`outline`){return r`
      <moul-button variant=${i} @click=${a(()=>this.openDrawer(t))}>
        <admin-icon slot="prefix" name=${n} size="16"></admin-icon>
        ${e}
      </moul-button>
    `}info(e,t){return r`<div class="info"><span class="info-label">${e}</span><span class="info-value">${t}</span></div>`}overview(e,t){return r`<div class="section"><p class="intro">${e}</p><div class="grid-2">${t}</div></div>`}renderRateLimits(){let e=this.saved?.rate_limiting_enabled===`true`;return this.card(`gauge`,`Rate Limiting & Abuse Prevention`,r`
        <span class="inline" style="gap: var(--spacing-3)">
          <span class="inline">
            <span class="muted" style="font-size: var(--font-size-sm)">Global Throttle:</span>
            <moul-switch
              ?is-checked=${e}
              @change=${e=>this.updateMutation.mutate({rate_limiting_enabled:e.detail.isChecked?`true`:`false`})}
            >
              ${e?`Enabled`:`Disabled`}
            </moul-switch>
          </span>
          ${this.editButton(`Add Rule`,`ratelimit-add`,`plus`,`primary`)}
        </span>
      `,r`
        <div class="section">
          <p class="intro">
            Configure granular sliding-window rate limiters per route, collection, or authentication status to protect against
            brute-force and DDoS attacks.
          </p>
          <admin-data-table
            aria-label="Rate Limit Rules Table"
            dense
            .columns=${[{key:`label`,title:`Rule Pattern / Route`,render:e=>r`<span style="font-weight: 600">${e.label}</span>`},{key:`maxRequests`,title:`Max Requests`,align:`end`,render:e=>`${e.maxRequests} req`},{key:`interval`,title:`Window (Seconds)`,align:`end`,render:e=>`${e.interval}s`},{key:`targetedUsers`,title:`Targeted Audience`,render:e=>{let t=e.targetedUsers===`authenticated`?`primary`:e.targetedUsers===`guest`?`warning`:``,n=e.targetedUsers?.toUpperCase()||`ALL`;return t?r`<moul-badge tone=${t}>${n}</moul-badge>`:r`<moul-badge variant="bordered">${n}</moul-badge>`}},{key:`__actions`,title:`Actions`,render:e=>r`
          <span style="display: inline-flex; gap: var(--spacing-2)">
            <moul-button variant="ghost" is-icon size="sm" aria-label=${`Edit ${e.label}`} @click=${a(()=>this.openDrawer(`ratelimit-edit`,e.index))}>
              <admin-icon name="pencil-simple" size="16"></admin-icon>
            </moul-button>
            <moul-button
              variant="ghost"
              is-icon
              size="sm"
              aria-label=${`Delete ${e.label}`}
              @click=${a(()=>this.ruleToDelete={index:e.index,label:e.label})}
            >
              <admin-icon name="trash" size="16" color="var(--color-error-500)"></admin-icon>
            </moul-button>
          </span>
        `}]}
            .rows=${this.rules.map((e,t)=>({...e,index:t}))}
            .rowKey=${e=>String(e.index)}
          >
            <moul-empty-state slot="empty" size="sm">
              <admin-icon slot="icon" name="gauge" size="32" color="var(--color-fg-subtle)"></admin-icon>
              <span slot="title">No rate limit rules</span>
              <span slot="description">Add custom rules to protect sensitive endpoints from traffic spikes.</span>
              <moul-button slot="actions" variant="outline" @click=${a(()=>this.openDrawer(`ratelimit-add`))}>
                <admin-icon slot="prefix" name="plus" size="14"></admin-icon>
                Add Rule
              </moul-button>
            </moul-empty-state>
          </admin-data-table>
        </div>
      `)}renderOAuth(){let e=this.saved,t=(t,n,i,a,o,s)=>{let c=e?.[`oauth_${t}_enabled`]===`true`;return r`
        <moul-card>
          <moul-card-body>
            <div class="provider-header">
              <span class="inline">
                <admin-icon name=${i} weight=${a} size="22" color=${o}></admin-icon>
                <span class="provider-name">${n}</span>
              </span>
              ${D(c,`ACTIVE`,`INACTIVE`)}
            </div>
            ${this.info(`Client ID`,e?.[`oauth_${t}_client_id`]||`Not configured`)}
          </moul-card-body>
          <moul-card-footer>${this.editButton(`Configure ${n}`,s,`gear`)}</moul-card-footer>
        </moul-card>
      `};return r`
      <div class="section">
        ${this.card(`link-simple`,`Global OAuth Callback Redirect URL`,this.editButton(`Configure Redirect`,`oauth-global`),this.info(`Application Redirect URL`,e?.oauth_redirect_url?r`<span class="info-code">${e.oauth_redirect_url}</span>`:`—`))}
        <div class="grid-3">
          ${t(`github`,`GitHub`,`github-logo`,`fill`,`var(--color-fg)`,`oauth-github`)}
          ${t(`google`,`Google`,`google-logo`,`bold`,`#EA4335`,`oauth-google`)}
          ${t(`apple`,`Apple`,`apple-logo`,`fill`,`var(--color-fg)`,`oauth-apple`)}
        </div>
      </div>
    `}renderAccount(){let e=this.account.data,t=f.user,n=e?.createdAt||e?.created_at,i=e?.updatedAt||e?.updated_at;return this.card(`user-gear`,`Root Administrator Account`,r`<span class="inline">${this.editButton(`Edit Account`,`account`)} ${this.editButton(`Change Password`,`password`,`lock-key`,`primary`)}</span>`,this.overview(`The root administrator account maintains ultimate privileges over collections, engine configurations, access controls, and backups. You can update your display name, username, and email below.`,[this.info(`Display Name`,e?.name||t?.name||t?.username||`admin`),this.info(`Username`,`@${e?.username||t?.username||`admin`}`),this.info(`Email Address`,e?.email||t?.email||`None configured`),this.info(`Role & Privileges`,`Root Superadministrator (Full Access)`),...n?[this.info(`Account Created`,new Date(n).toLocaleString())]:[],...i?[this.info(`Last Updated`,new Date(i).toLocaleString())]:[]]))}renderPanel(e){let t=this.saved,n=e=>e||`—`;switch(e){case`s3`:return this.card(`cloud`,`S3 Object Storage`,this.editButton(`Configure S3`,`s3`),this.overview(`Store and serve user-uploaded files directly through Amazon S3, Cloudflare R2, MinIO, or compatible S3 object storage providers instead of local disk.`,[this.info(`Status`,D(t?.file_s3_enabled===`true`,`ENABLED`,`DISABLED (LOCAL STORAGE)`)),this.info(`Bucket Name`,n(t?.file_s3_bucket)),this.info(`Endpoint URL`,n(t?.file_s3_endpoint)),this.info(`Region`,n(t?.file_s3_region))]));case`litestream`:return this.card(`floppy-disk`,`Litestream Real-Time Replication`,this.editButton(`Configure Replication`,`litestream`),this.overview(`Continuously replicate SQLite transactions to S3, Cloudflare R2, or remote object storage for disaster recovery and automated point-in-time restores.`,[this.info(`Replication Status`,D(t?.litestream_enabled===`true`,`ACTIVE`,`INACTIVE`)),this.info(`Replica Target Bucket`,n(t?.litestream_s3_bucket)),this.info(`Replica Path`,n(t?.litestream_replica_path)),this.info(`Endpoint`,n(t?.litestream_s3_endpoint))]));case`ratelimit`:return this.renderRateLimits();case`rootips`:return this.card(`globe-hemisphere-west`,`Root User Security IP Whitelist`,this.editButton(`Configure IP Whitelist`,`rootips`),this.overview(`Restrict access to root administrator logins and elevated API endpoints to specific authorized IP addresses and CIDR subnets.`,[this.info(`IP Check Status`,D(t?.root_user_ip_enabled===`true`,`ENFORCED`,`DISABLED (ANY IP ALLOWED)`)),this.info(`Allowed IPs & Subnets`,t?.root_user_allowed_ips?r`<span class="info-code">${t.root_user_allowed_ips}</span>`:`—`)]));case`email`:return this.card(`envelope-simple`,`Transactional Email Delivery`,this.editButton(`Configure Email Provider`,`email`),this.overview(`Enable transactional email delivery to send password reset links, OTP verification codes, and user invites via AWS SES, Resend, Mailgun, SendGrid, Cloudflare, or local stdout console.`,[this.info(`Email Service Status`,D(t?.email_enabled===`true`,`ENABLED`,`DISABLED`)),this.info(`Active Provider`,r`<span style="text-transform: uppercase">${t?.email_provider||`console`}</span>`),this.info(`Sender Address`,n(t?.email_from_address)),this.info(`Sender Name`,n(t?.email_from_name))]));case`oauth`:return this.renderOAuth();default:return this.renderAccount()}}renderSettingField(e){let t=String(this.form[e.key]??``),n=y(e,this.form);switch(e.kind){case`switch`:return r`
          <moul-switch
            ?is-checked=${t===`true`}
            @change=${t=>this.set(e.key,t.detail.isChecked?`true`:`false`)}
          >
            ${e.label}
          </moul-switch>
        `;case`select`:return r`
          <moul-select
            label=${e.label}
            selected-key=${t}
            @selectionchange=${t=>{t.detail.selectedKey&&this.set(e.key,t.detail.selectedKey)}}
          >
            ${e.options?.map(e=>r`<moul-select-item key=${e.key}>${e.label}</moul-select-item>`)}
          </moul-select>
        `;case`textarea`:return r`
          <moul-text-area
            label=${e.label}
            placeholder=${e.placeholder??``}
            description=${e.description??``}
            rows="4"
            ?is-required=${n}
            .value=${t}
            @input=${t=>this.set(e.key,g(t))}
          ></moul-text-area>
        `;default:return r`
          <moul-text-field
            label=${e.label}
            type=${e.kind}
            placeholder=${e.placeholder??``}
            description=${e.description??``}
            ?is-required=${n}
            .value=${t}
            @input=${t=>this.set(e.key,g(t))}
          ></moul-text-field>
        `}}text(e,t,n={}){return r`
      <moul-text-field
        label=${t}
        type=${n.type??`text`}
        placeholder=${n.placeholder??``}
        description=${n.description??``}
        ?is-required=${!!n.required}
        .value=${String(this.form[e]??``)}
        @input=${t=>this.set(e,g(t))}
      ></moul-text-field>
    `}renderDrawerForm(e){if(e===`ratelimit-add`||e===`ratelimit-edit`){let e=(e,t,n)=>r`
        <moul-number-field
          label=${t}
          placeholder=${n}
          min="1"
          is-required
          .value=${this.form[e]??null}
          @input=${t=>this.set(e,t.target.value??0)}
        ></moul-number-field>
      `;return r`
        ${this.text(`label`,`Rule Pattern / Label`,{placeholder:`e.g. *:auth, /api/batch, users:list`,description:`Use *:auth for all authentication actions or specify exact API paths.`,required:!0})}
        ${e(`maxRequests`,`Max Requests (per IP)`,`10`)} ${e(`interval`,`Interval Window (seconds)`,`3`)}
        <moul-select
          label="Target Audience"
          selected-key=${this.form.targetedUsers??`all`}
          @selectionchange=${e=>{e.detail.selectedKey&&this.set(`targetedUsers`,e.detail.selectedKey)}}
        >
          ${w.map(e=>r`<moul-select-item key=${e.key}>${e.label}</moul-select-item>`)}
        </moul-select>
      `}return e===`account`?r`
        ${this.text(`username`,`Username`,{placeholder:`e.g. admin`,description:`Unique username used for login and CLI authentication`,required:!0})}
        ${this.text(`name`,`Display Name`,{placeholder:`e.g. Administrator`,description:`Full or display name shown across the administration interface`})}
        ${this.text(`email`,`Email Address`,{type:`email`,placeholder:`e.g. admin@moul.dev`,description:`Root contact email address`})}
      `:e===`password`?r`
        ${this.text(`currentPassword`,`Current Password`,{type:`password`,placeholder:`••••••••`,required:!0})}
        ${this.text(`newPassword`,`New Password`,{type:`password`,placeholder:`••••••••`,description:`Minimum 8 characters (1 uppercase, 1 lowercase, 1 digit)`,required:!0})}
        ${this.text(`passwordConfirm`,`Confirm New Password`,{type:`password`,placeholder:`••••••••`,required:!0})}
      `:v[e].fields.map(e=>this.renderSettingField(e))}renderDrawer(){let t=this.drawerMode,n=t?C[t]??v[t]?.title:``,i=this.isDirty,o=this.isSaving?`Saving...`:t===`account`?`Save Account`:t===`password`?`Update Password`:`Save Settings`;return r`
      <div @keydown=${this.onDrawerKeydown}>
        <moul-drawer
          placement="right"
          size="md"
          ?is-open=${t!==null}
          ?is-dismissable=${!i}
          @openchange=${e=>{e.target===e.currentTarget&&!e.detail.isOpen&&this.closeDrawer()}}
        >
          <div slot="header" class="drawer-title">
            <span class="inline">
              ${n} ${i?r`<moul-badge tone="warning" size="sm">Unsaved Changes</moul-badge>`:e}
            </span>
            <moul-button variant="ghost" is-icon size="sm" aria-label="Close" @click=${a(()=>this.requestClose())}>
              <admin-icon name="x" size="16"></admin-icon>
            </moul-button>
          </div>
          <form
            @submit=${e=>{e.preventDefault(),this.save()}}
            @keydown=${h}
          >
            ${t?this.renderDrawerForm(t):e}
          </form>
          <moul-button slot="footer" variant="ghost" @click=${a(()=>this.requestClose())}>Cancel</moul-button>
          <moul-button slot="footer" variant="primary" ?is-disabled=${this.isSaving} @click=${a(()=>this.save())}>
            ${o}
          </moul-button>
        </moul-drawer>
      </div>
    `}renderDialogs(){return r`
      <moul-alert-dialog
        tone="warning"
        size="sm"
        ?is-open=${this.showDiscardDialog}
        @openchange=${e=>{e.detail.isOpen||(this.showDiscardDialog=!1)}}
      >
        <span slot="header">Discard Unsaved Changes?</span>
        <p slot="body" class="dialog-text">
          You have unsaved changes in this configuration section. If you close now, your modifications will be discarded.
        </p>
        <moul-button slot="footer" variant="outline" @click=${a(()=>this.showDiscardDialog=!1)}>Keep Editing</moul-button>
        <moul-button
          slot="footer"
          variant="danger"
          @click=${a(()=>{this.showDiscardDialog=!1,this.closeDrawer()})}
        >
          Discard Changes
        </moul-button>
      </moul-alert-dialog>

      <moul-alert-dialog
        tone="error"
        size="sm"
        ?is-open=${this.ruleToDelete!==null}
        @openchange=${e=>{e.detail.isOpen||(this.ruleToDelete=null)}}
      >
        <span slot="header">Delete Rate Limit Rule</span>
        <p slot="body" class="dialog-text">
          Are you sure you want to delete the rate limit rule for <strong>“${this.ruleToDelete?.label}”</strong>? This change will
          take effect immediately.
        </p>
        <moul-button slot="footer" variant="outline" @click=${a(()=>this.ruleToDelete=null)}>Cancel</moul-button>
        <moul-button slot="footer" variant="danger" @click=${a(()=>this.deleteRule())}>Delete Rule</moul-button>
      </moul-alert-dialog>
    `}render(){let t=this.tab;return r`
      ${m(`Engine Settings`,`Manage object storage, litestream backups, rate limiting, security IP whitelist, transactional email, OAuth2 providers, and root credentials.`)}
      <moul-tabs
        variant="line"
        selected-key=${t}
        @selectionchange=${e=>{e.target===e.currentTarget&&d.navigate(`/settings`,{search:{tab:e.detail.selectedKey},replace:!0})}}
      >
        ${S.map(e=>r`
            <moul-tab slot="tab" key=${e.key}>
              <span class="tab-label"><admin-icon name=${e.icon} size="16"></admin-icon>${e.label}</span>
            </moul-tab>
          `)}
        ${S.map(n=>r`<moul-tab-panel key=${n.key}>${n.key===t?this.renderPanel(n.key):e}</moul-tab-panel>`)}
      </moul-tabs>
      ${this.renderDrawer()} ${this.renderDialogs()}
    `}};customElements.define(`admin-settings-page`,O);export{O as AdminSettingsPage};