import{o as e,r as t,t as n}from"./press-BQyLhwVv.js";import{i as r,t as i}from"./router-B1wwybcr.js";import{Pn as a}from"./index-DeN0Cdry.js";import{n as o,t as s}from"./forms-ChSyHPkg.js";import{n as c,r as l,t as u}from"./auth-card-B-yRZZTk.js";var d=class extends t{static styles=c;static properties={masterKey:{state:!0},identity:{state:!0},password:{state:!0},error:{state:!0},loading:{state:!0}};constructor(){super(),this.masterKey=``,this.identity=``,this.password=``,this.error=null,this.loading=!1,new r(this,a)}async onVerifyKey(e){e.preventDefault(),this.error=null;let t=this.masterKey.trim();if(!t)this.error=`Master Admin Key is required`;else{this.loading=!0;try{(await a.verifyAndSetAdminKey(t)).needsSetup&&i.navigate(`/setup`)}catch(e){this.error=e.message||`Invalid Master Admin Key (Unauthorized)`}finally{this.loading=!1}}}async onUserLogin(e){if(e.preventDefault(),this.error=null,!this.identity.trim()||!this.password)this.error=`Username/Email and Password are required`;else{this.loading=!0;try{await a.adminLogin(this.identity.trim(),this.password),i.navigate(`/overview`)}catch(e){this.error=e.message||`Authentication failed. Please verify your credentials.`}finally{this.loading=!1}}}onClearKey=()=>{a.clearAdminKey(),this.masterKey=``,this.error=null};renderBody(){return a.adminKey?a.needsSetup?e`
        ${l(this.onClearKey)}
        <moul-alert tone="warning" description="Initial setup required. Create the root administrator account to proceed."></moul-alert>
        <moul-button variant="primary" size="lg" @click=${n(()=>i.navigate(`/setup`))}>Create Root Admin</moul-button>
      `:e`
      <form @submit=${this.onUserLogin} @keydown=${o}>
        ${l(this.onClearKey)}
        <moul-text-field
          label="Username or Email"
          placeholder="admin@example.com"
          is-required
          .value=${this.identity}
          @input=${e=>this.identity=s(e)}
        ></moul-text-field>
        <moul-text-field
          label="Password"
          type="password"
          placeholder="••••••••"
          is-required
          .value=${this.password}
          @input=${e=>this.password=s(e)}
        ></moul-text-field>
        <moul-button type="submit" variant="primary" size="lg" ?is-disabled=${this.loading}>
          ${this.loading?`Signing in...`:`Sign In`}
        </moul-button>
      </form>
    `:e`
        <form @submit=${this.onVerifyKey} @keydown=${o}>
          <moul-text-field
            label="Master Admin Key"
            type="password"
            placeholder="Enter MOUL_ADMIN_KEY"
            description="Configured via MOUL_ADMIN_KEY"
            is-required
            .value=${this.masterKey}
            @input=${e=>this.masterKey=s(e)}
          ></moul-text-field>
          <moul-button type="submit" variant="primary" size="lg" ?is-disabled=${this.loading}>
            ${this.loading?`Verifying...`:`Continue`}
          </moul-button>
        </form>
      `}render(){let t=!!a.adminKey;return u({title:t?`moul console`:`Connect to moul`,subtitle:t?`Sign in with your administrator credentials`:`Enter your Master Admin Key to access the administration console`,body:e`
        ${this.error?e`<moul-alert tone="error" description=${this.error}></moul-alert>`:``}
        ${this.renderBody()}
      `,footer:t&&a.needsSetup?e`First time running moul? <moul-link href=${i.href(`/setup`)}>Set up root administrator</moul-link>`:void 0})}};customElements.define(`admin-login-page`,d);export{d as AdminLoginPage};