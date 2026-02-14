# CSV Formatter Tool

A React-based tool for formatting and cleaning CSV files, built with Vite and Tailwind CSS.

## Features
- **CSV Parsing**: Client-side parsing of CSV files.
- **Data Cleaning**: Normalize characters (half-width/full-width), standardize phone numbers, etc.
- **Column Management**: Reorder, hide/show, split, and merge columns.
- **Filtering**: Filter rows based on text.
- **Error Checking**: Detect empty required fields.
- **Download**: Export the cleaned data as CSV.

## Project Structure
- `src/App.jsx`: Main application logic (migrated from `csv-formatter-final.jsx`).
- `src/index.css`: Tailwind CSS configuration.
- `vite.config.js`: Vite configuration for GitHub Pages.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

## Deployment to GitHub Pages

1.  **Build the project**:
    ```bash
    npm run build
    ```

2.  **Deploy**:
    -   Push the `dist` folder content to your `gh-pages` branch, or
    -   Configure GitHub Actions to build and deploy from this branch.
    -   Since `base: './'` is set in `vite.config.js`, the built files in `dist/` can be served from any subdirectory.

## Note
This project was migrated from a standalone JSX file.
