declare module 'nodemailer-mailjet-transport'
{
  import type { Transport } from 'nodemailer';

  interface Options
  {
    auth: {
      apiKey: string;
      apiSecret: string;
    };
    SandboxMode?: boolean;
  }

  export class MailjetTransport
  {
    constructor( options: Options ) {
    }
  }

  export default function( options: Options ): Transport<MailjetTransport>;
}

declare module 'svelte-file-dropzone'
{
}
declare module 'svelte-gravatar'
{
}
