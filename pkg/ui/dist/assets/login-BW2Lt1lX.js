import{a as e,o as t,s as n,t as r,v as i,x as a}from"./index-RipJGQkD.js";import{n as o,t as s}from"./forms-ChSyHPkg.js";import{n as c,r as l,t as u}from"./auth-card-Cc3kJepL.js";var d=class extends i{static styles=c;static properties={masterKey:{state:!0},identity:{state:!0},password:{state:!0},error:{state:!0},loading:{state:!0}};constructor(){super(),this.masterKey=``,this.identity=``,this.password=``,this.error=null,this.loading=!1,new n(this,e)}async onVerifyKey(n){n.preventDefault(),this.error=null;let r=this.masterKey.trim();if(!r)this.error=`Master Admin Key is required`;else{this.loading=!0;try{(await e.verifyAndSetAdminKey(r)).needsSetup&&t.navigate(`/setup`)}catch(e){this.error=e.message||`Invalid Master Admin Key (Unauthorized)`}finally{this.loading=!1}}}async onUserLogin(n){if(n.preventDefault(),this.error=null,!this.identity.trim()||!this.password)this.error=`Username/Email and Password are required`;else{this.loading=!0;try{await e.adminLogin(this.identity.trim(),this.password),t.navigate(`/overview`)}catch(e){this.error=e.message||`Authentication failed. Please verify your credentials.`}finally{this.loading=!1}}}onClearKey=()=>{e.clearAdminKey(),this.masterKey=``,this.error=null};renderBody(){return e.adminKey?e.needsSetup?a`
        ${l(this.onClearKey)}
        <moul-alert tone="warning" description="Initial setup required. Create the root administrator account to proceed."></moul-alert>
        <moul-button variant="primary" size="lg" @click=${r(()=>t.navigate(`/setup`))}>Create Root Admin</moul-button>
      `:a`
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
    `:a`
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
      `}render(){let n=!!e.adminKey;return u({title:n?`moul console`:`Connect to moul`,subtitle:n?`Sign in with your administrator credentials`:`Enter your Master Admin Key to access the administration console`,body:a`
        ${this.error?a`<moul-alert tone="error" description=${this.error}></moul-alert>`:``}
        ${this.renderBody()}
      `,footer:n&&e.needsSetup?a`First time running moul? <moul-link href=${t.href(`/setup`)}>Set up root administrator</moul-link>`:void 0})}};customElements.define(`admin-login-page`,d);export{d as AdminLoginPage};