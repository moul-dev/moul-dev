import{o as e,r as t,t as n}from"./press-CVc8c9H4.js";import{t as r}from"./client-DaTS5Mxb.js";import{i,t as a}from"./router-B1wwybcr.js";import{Pn as o}from"./index-BTyfsV_n.js";import{n as s,t as c}from"./forms-ChSyHPkg.js";import{n as l,r as u,t as d}from"./auth-card-aU1brxcL.js";var f=class extends t{static styles=l;static properties={masterKey:{state:!0},username:{state:!0},email:{state:!0},password:{state:!0},passwordConfirm:{state:!0},error:{state:!0},loading:{state:!0}};constructor(){super(),this.masterKey=``,this.username=``,this.email=``,this.password=``,this.passwordConfirm=``,this.error=null,this.loading=!1,new i(this,o)}async onVerifyKey(e){e.preventDefault(),this.error=null;let t=this.masterKey.trim();if(!t)this.error=`Master Admin Key is required`;else{this.loading=!0;try{(await o.verifyAndSetAdminKey(t)).needsSetup||a.navigate(`/login`)}catch(e){this.error=e.message||`Invalid Master Admin Key (Unauthorized)`}finally{this.loading=!1}}}async onSetupSubmit(e){if(e.preventDefault(),this.error=null,this.password!==this.passwordConfirm)this.error=`Passwords do not match`;else if(this.password.length<8)this.error=`Password must be at least 8 characters long`;else{this.loading=!0;try{await r.setupRootUser({username:this.username.trim(),email:this.email.trim(),password:this.password});try{await o.adminLogin(this.username.trim(),this.password),a.navigate(`/overview`)}catch{a.navigate(`/login`)}}catch(e){this.error=e.message||`Failed to setup root user`}finally{this.loading=!1}}}onClearKey=()=>{o.clearAdminKey(),this.masterKey=``,this.error=null};renderBody(){return o.adminKey?o.needsSetup?e`
      <form @submit=${this.onSetupSubmit} @keydown=${s}>
        ${u(this.onClearKey)}
        <moul-text-field
          label="Username"
          placeholder="admin"
          is-required
          .value=${this.username}
          @input=${e=>this.username=c(e)}
        ></moul-text-field>
        <moul-text-field
          label="Email"
          type="email"
          placeholder="admin@example.com"
          is-required
          .value=${this.email}
          @input=${e=>this.email=c(e)}
        ></moul-text-field>
        <moul-text-field
          label="Password"
          type="password"
          placeholder="••••••••"
          description="Minimum 8 characters"
          is-required
          .value=${this.password}
          @input=${e=>this.password=c(e)}
        ></moul-text-field>
        <moul-text-field
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          is-required
          .value=${this.passwordConfirm}
          @input=${e=>this.passwordConfirm=c(e)}
        ></moul-text-field>
        <moul-button type="submit" variant="primary" size="lg" ?is-disabled=${this.loading}>
          ${this.loading?`Creating account...`:`Create Account`}
        </moul-button>
      </form>
    `:e`
        ${u(this.onClearKey)}
        <moul-alert tone="primary" description="Root administrator already created. Please sign in with your credentials."></moul-alert>
        <moul-button variant="primary" size="lg" @click=${n(()=>a.navigate(`/login`))}>Go to Sign In</moul-button>
      `:e`
        <form @submit=${this.onVerifyKey} @keydown=${s}>
          <moul-text-field
            label="Master Admin Key"
            type="password"
            placeholder="Enter MOUL_ADMIN_KEY"
            description="Configured via MOUL_ADMIN_KEY"
            is-required
            .value=${this.masterKey}
            @input=${e=>this.masterKey=c(e)}
          ></moul-text-field>
          <moul-button type="submit" variant="primary" size="lg" ?is-disabled=${this.loading}>
            ${this.loading?`Verifying...`:`Continue`}
          </moul-button>
        </form>
      `}render(){let t=!!o.adminKey;return d({title:t?`Welcome to moul`:`Connect to moul`,subtitle:t?`Set up your root administrator account.`:`Enter your Master Admin Key to continue.`,body:e`
        ${this.error?e`<moul-alert tone="error" description=${this.error}></moul-alert>`:``}
        ${this.renderBody()}
      `,footer:t?e`Already set up? <moul-link href=${a.href(`/login`)}>Sign In</moul-link>`:void 0})}};customElements.define(`admin-setup-page`,f);export{f as AdminSetupPage};