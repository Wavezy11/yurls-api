
## Setup Instructions

1. Clone the repository:
   \`\`\`
   git clone https://github.com/Wavezy11/yurls-api.git
   cd pit
   \`\`\`

2. If you're using SharePoint integration, create a `.env` file in the root directory with your SharePoint credentials:
   \`\`\`
   TENANT_ID=your_tenant_id
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_client_secret
   SITE_ID=your_sharepoint_site_id
   \`\`\`

3. Open `index.html` in a web browser to view the application locally.

## Usage

- The main page displays categories and subjects.
- Use the search bar to filter subjects.
- Click on a subject to open a modal with detailed information.
- The "Doorgaan" button closes the modal.

## SharePoint Integration

This project includes integration with SharePoint for data management. To use this feature:

1. Ensure you have the necessary permissions and credentials for your SharePoint site.
2. Update the SharePoint site and list IDs in the `fetchSharePointData` function in `main.js`.
3. Implement proper authentication for production use (the current implementation uses a dummy token).

## Contributing

Contributions to the PIT project are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

Farhan Farah - Mohammed5049@protonmail.com

Project Link: [https://github.com/wavezy11]