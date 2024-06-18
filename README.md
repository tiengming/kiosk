# Kiosk
Self-hosted ebook library with a gorgeous web interface, book collections, and metadata editing.

<img width="1723" alt="Screenshot of Kiosk" src="https://user-images.githubusercontent.com/6115429/214013069-f1f578e7-8e6a-4404-8b16-74b2f93c3f0e.png">

Kiosk allows you to manage your books, sort them into collections, and to read and download them. It is built on
[SvelteKit](https://kit.svelte.dev) and can run in serverless environments. Kiosk also employs password-less
authentication via [Passkeys](https://www.passkeys.io).

Features
--------
- Simple library management: Import your ebooks, update their metadata, and get a neat library accessible from all your
  devices.
- Automatic metadata retrieval: Kiosk will automatically fetch information about books, authors, and publishers from
  public knowledge graph data.
- Easy search integration: Kiosk integrates search services to index and search content in your library.
- Seamless passkey authentication: By using passkeys, you can sign in to Kiosk using Windows Hello, Touch ID or Face ID
  and similar authenticators.
- Book collections: Kiosk allows you to create collections for your books.
- Easy to self-host: Kiosk is built for maximum flexibility. Run it on Docker, Cloudflare, Vercel, AWS or directly on
  Node.js. Thanks to [SvelteKit](https://kit.svelte.dev), Kiosk can run pretty much anywhere.
- Secure: Kiosk uses modern web technologies and is built with security in mind. It does not track you, and it does not
  send your data to third parties.

Project Goals
-------------
Kiosk tries to enable you to:

- Self-host a delightful, secure, and capable bookshelf for yourself and your family
- Form a small, private social network around reading with your family and friends
- Store, analyse, and enhance your ebook files
- Publish your reading lists and reviews

### Non-goals

Kiosk does not aim to:

- Replace your existing ebook reader (nor Calibre, for that matter)
- Make it easy to pirate books
- Be a community for exchanging books with lots of people

