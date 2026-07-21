# Smart CV Builder

A professional, high-performance programmatic resume builder built with React 19, Next.js (App Router), Tailwind CSS v4, and `@react-pdf/renderer`.

Smart CV Builder enables users to design, edit, and export ATS-friendly resumes in real-time. It features a side-by-side editing interface, automated offline draft saves, portrait photo uploads, and pixel-perfect programmatic PDF downloads.

---

## Key Features

1. **Live A4 Preview**
   * Edit form inputs on the left and see changes instantly update on a mock A4 sheet preview on the right.
   * Beautifully rendered typography using modern system sans-serif fonts.

2. **High-Fidelity PDF Export**
   * Programmatic, client-side PDF generation powered by `@react-pdf/renderer`.
   * Completely avoids browser print margin issues, unwanted header/footer print URLs, and styling shifts.
   * Implements block wrapping to protect sections (Experience, Education, Projects) from splitting awkwardly across page boundaries.
   * Compiles the PDF **on-demand** only when the download button is clicked, preventing input latency in the form editor.

3. **Profile Photo Upload**
   * Supports dragging/selecting images directly in the Personal Details form.
   * Automatically encodes uploads as Base64 data URLs for seamless client-side storage.
   * Includes file size validations (under **2MB**) to optimize local storage consumption.
   * Styled in a professional 3:4 portrait aspect ratio, both in the form thumbnail and the PDF header.

4. **Offline Draft Persistence**
   * Automatically saves your progress to browser `localStorage` as you type.
   * Restores your draft instantly upon reloading the page.
   * Includes a safe confirmation modal to clear cache and reset all details to the default template.

5. **Fluid Responsive Layout**
   * **Desktop (1024px+)**: Elegant split-screen panel grid (editor left, sticky A4 preview right).
   * **Mobile / Tablet**: Flowing stacked layout. Scroll behavior switches from nested viewports to single-page scroll to prevent mobile scroll hijacking.
   * **Navbar collapse**: Action buttons automatically shrink (e.g. showing "Save" and "Download" instead of "Save Draft" and "Download PDF") to fit on a single row on small phone viewports.

---

## Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router, static prerendering)
* **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict types)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (using Base UI primitives)
* **Icons**: [Lucide React](https://lucide.dev/)
* **PDF Compiler**: [@react-pdf/renderer](https://react-pdf.org/) (programmatic layout engine)

---

## Project Structure

```bash
├── public/                  # Static assets (icons, SVGs)
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── cv-builder/      # Main CV Builder workspace route
│   │   ├── layout.tsx       # Root layout & Metadata
│   │   ├── page.tsx         # Sleek landing page
│   │   └── globals.css      # Core tailwind styles
│   ├── components/          # Reusable React components
│   │   ├── ui/              # shadcn/ui components (accordion, button, badge, input, etc)
│   │   ├── CVBuilder.tsx    # State coordinator & local saver
│   │   ├── CVForm.tsx       # Input fields & section wrappers
│   │   ├── CVPreview.tsx    # A4 mockup page sheet wrapper
│   │   ├── CVTemplateModern.tsx # HTML rendering template
│   │   ├── CVDocumentPDF.tsx    # Programmatic PDF layout template
│   │   └── ExportButton.tsx     # On-demand PDF downloader
│   ├── lib/
│   │   ├── default-cv.ts    # Default prefilled candidate data
│   │   └── utils.ts         # Utility class helpers (cn)
│   └── types/
│       └── cv.ts            # TypeScript interface definitions
```

---

## Getting Started

### 1. Installation
Clone the repository, navigate into the project folder, and install the npm dependencies:
```bash
npm install
```

### 2. Development Server
Start the local Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 3. Production Build
To run static typechecks, lint rules, and compile the optimized production bundle:
```bash
npm run build
```
You can preview the production build locally using `npm run start`.
