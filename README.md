# CampusFind AI

CampusFind AI is a web-based Campus Lost & Found portal that helps students report, search, and recover lost or found items on campus.

## Features

- Report Lost and Found items
- Add item name, category, description, location, date, and contact information
- Search reported items
- Filter items by category and location
- Dashboard for Lost, Found, Recovered, and Pending items
- Mark items as recovered
- Smart Match for finding possible Lost & Found item matches
- Smart Recovery Assistant with location-based recovery steps
- Recovery checklist with progress tracking
- Responsive and user-friendly interface
- Browser-based data storage using localStorage

## Technologies Used

- HTML5
- CSS3
- JavaScript
- LocalStorage

## Smart Match

The Smart Match feature checks reported Lost items against available Found items using:

- Item name
- Category
- Campus location

It provides a match score and shows the reasons for a possible match.

## Smart Recovery Assistant

The Smart Recovery Assistant creates a simple recovery plan based on the last known location of a lost item.

Users can:

- Follow suggested recovery steps
- Mark completed steps
- Track recovery progress

## Project Structure

```text
campus-found-and-lost/
│
├── index.html
├── style.css
├── script.js
└── README.md
