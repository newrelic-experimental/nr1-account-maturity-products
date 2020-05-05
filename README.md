## During active/local development, these are the steps you need to do:
1. In the dependent project (i.e. thirdparty or V2), issue this command:
   - npm install -S `<local path to>/maturity-products/`
2. When you're ready to test your changes, do:
   - npm run dev
3. The dependent project should be able to automatically pick up the changes, but if you see warnings in the terminal about 'undetected changes', then restart your nr1 terminal

## Upon releasing a stable version:
1. Update the version number in package.json
2. Push the src folder to the repo
3. In the dependent project:
   - Make sure that maturity-products points to git+ssh://git@source.datanerd.us:CSE/maturity-products
   - Do an 'npm update maturity-products'
