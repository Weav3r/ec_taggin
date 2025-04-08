Here’s the updated specification with the primary color set to red:

### Project Specification for Vanilla HTML/CSS/JS Page

#### 1. Project Overview

- **Project Name**: EC Helper
- **Description**: A simple responsive web app for agents.

#### 2. Requirements

##### 2.1 Functional Requirements

- **Header Section**:

  - Contains the website logo on the left.
  - Two navigational links: "Interaction" and "SR".
  - The navigation links should be styled and responsive.

- **Main Content Section**:

  - **Interaction Page**:
    - Title: "Interaction".
    - Input fields:
      - Calling Number
      - Incident Number
      - Name
      - Reason for Calling
      - Findings
      - Resolution
    - A "Generate" button below the input fields.
    - When the "Generate" button is clicked, it should take the text from any non-empty input field and structure them as JSON.
    - The generated JSON should be formatted and displayed as the first component in a list of cards below the "Generate" button.

- **Card Display**:

  - Each card should display the following information:
    - **Calling Number**: corresponding value
    - **Incident Number**: corresponding value
    - **Name**: corresponding value
    - **Reason for Calling**: corresponding value
    - **Findings**: corresponding value
    - **Resolution**: corresponding value
  - Each card should have a consistent design, including padding, borders, and background color for clarity.
  - Each card should include a 'Copy' button that, when clicked, copies the contents of the card to the clipboard.
  - Cards should be responsive and stack appropriately on smaller screens.

- **Footer Section**:
  - Contains sample copyright information, e.g., "© 2023 EC Helper. All rights reserved."
  - May also include social media links (e.g., Facebook, Twitter, LinkedIn) if applicable.

##### 2.2 Non-Functional Requirements

- **Performance**: The page should load within 2 seconds on a standard broadband connection.
- **Accessibility**: The page should be accessible according to WCAG 2.1 guidelines.
- **Responsiveness**: The layout should be responsive and work on various screen sizes (mobile, tablet, desktop).

#### 3. Technical Specifications

##### 3.1 HTML Structure

- Use semantic HTML5 elements (e.g., `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
- Ensure proper use of headings (`<h1>`, `<h2>`, etc.) for SEO and accessibility.
- Include meta tags for character set, viewport settings, and description.

##### 3.2 CSS Styling

- Use a separate CSS file for styles.
- Follow a mobile-first approach for responsive design.
- Use Flexbox or CSS Grid for layout.
- **Primary Color**: Red (use this color for buttons, links, and highlights).
- Define typography (font families, sizes, weights).
- Include hover effects for buttons and links.
- Style the cards for clarity and visual appeal.

##### 3.3 JavaScript Functionality

- Use a separate JavaScript file for scripts.
- Implement event listeners for the "Generate" button.
- When the button is clicked, gather the values from the input fields, check for non-empty fields, and structure the data as JSON.
- Create a new card element for each generated JSON object and append it to the list of cards below the "Generate" button.
- Each card should display the corresponding values in the following format:
  - **Calling Number**: [value]
  - **Incident Number**: [value]
  - **Name**: [value]
  - **Reason for Calling**: [value]
  - **Findings**: [value]
  - **Resolution**: [value]
- Each card should include a 'Copy' button that, when clicked, copies the contents of the card to the clipboard. Use the Clipboard API or a fallback method for copying text.
- Ensure that the cards are displayed in a user-friendly format.

#### 4. User Interface Design

- **Color Palette**: Primary color is red.
- **Typography**: [Define font families and sizes]
- **Layout**: [Provide wireframes or mockups if available]

#### 5. Development Guidelines

- Follow best practices for code organization and commenting.
- Use version control (e.g., Git) for tracking changes.
- Ensure cross-browser compatibility (Chrome, Firefox, Safari, Edge).
- Validate HTML and CSS using W3C validators.

#### 6. Testing

- Conduct unit testing for JavaScript functions.
- Perform manual testing for responsiveness and accessibility.
- Test on multiple devices and browsers.

#### 7. Deployment

- Host the page on a web server (e.g., GitHub Pages, Netlify).
- Ensure

#### To upade with

Update the script.js to store the generated json outputs in localstore with the following structure:
{'date':e.g. '08_04_2025', 'interactions':[{'id': 1,datetime:''
'2025-04-08T08:27:52.122Z'',cn: '444555',in: '4447223',reason:'Stuck in loop',findings:'My findings',resolution:'Resolved'},...]}
where cn = calling number, in=incident number, reason=reason for calling,etc.
The list of interactions should be displayed as lists below the form ordered by the datetime in descending order. When the interaction page is loaded it should display all the stored interactions for the current date in the localstore as cards below the form.
