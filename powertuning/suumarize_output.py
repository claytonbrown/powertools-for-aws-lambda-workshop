import json
import glob
import xlsxwriter

# Create a workbook and add a worksheet.
workbook = xlsxwriter.Workbook('summary.xlsx')
worksheet = workbook.add_worksheet('PowerTuning')


# Start from the first cell. Rows and columns are zero indexed.
row = 1
col = 0

# Write a total using a formula.
worksheet.write(0, 0, 'FunctionName')
worksheet.write(0, 1, 'Power')
worksheet.write(0, 2, 'Cost')
worksheet.write(0, 3, 'Duration')
worksheet.write(0, 4, 'ExecutionCost')
worksheet.write(0, 5, 'LambdaCost')
worksheet.write(0, 6, 'Visualization')
#worksheet.write(0, 1, '=SUM(B1:B4)')


for file in glob.glob('./output/*.json'):
  print(file)

  with open(file, 'r') as f:
    data = json.load(f)
    # print(json.dumps(data, indent=2))
    f.close()

    if 'power' in data:
      # Add Summary
      row += 1
      worksheet.write(row, 0, file.split('/')[-1].split('.')[0] )
      worksheet.write(row, 1, data['power'])
      worksheet.write(row, 2, data['cost'])
      worksheet.write(row, 3, data['duration'])
      worksheet.write(row, 4, data['stateMachine']['executionCost'])
      worksheet.write(row, 5, data['stateMachine']['lambdaCost'])
      worksheet.write(row, 6, data['stateMachine']['visualization'])
      row_index = 6
      column_index = 6

      for stat in data['stats']:

        # Add Headings
        column_index += 1
        worksheet.write(row, column_index, f"Price:{stat['value']}")
        column_index += 1
        worksheet.write(row, column_index, f"Duration:{stat['value']}")

        # Add Stats
        row_index += 1
        worksheet.write(row, row_index, stat['averagePrice'])
        row_index += 1
        worksheet.write(row, row_index, stat['averageDuration'])

workbook.close()