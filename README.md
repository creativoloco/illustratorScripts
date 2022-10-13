# My own personal illustrator scripts
This is a  collection of scripts using adobe extendscript API with javascript for Adobe Illustrator CC.
This collection contains all scripts that I've wrote when Illustrator had not enough tools for perform the task that I need, or when the task requieres a lot of repetitives steps.
I hope this can help you in your job as it helped to me.

## How to use:
1. Download this repo
2. Then open illustrator
3. File > script > load script
4. Select the script and execute

# Scripts:
## EAN13 barcode generator
Is my own implementation of barcode algorithm based on wikipedia article [International Article Number](https://en.wikipedia.org/wiki/International_Article_Number). Which allows to create a barcode using *Rectangle Items* and *Text Items* only.
The last digit the check digit is generated automatically.

![EAN13Codebar](https://user-images.githubusercontent.com/30961691/195439415-e8cc9da5-2c2c-4234-ba72-5ad6b289a18c.gif)

## Clear Document
This script allows you to do a **deep cleaning** of illustrator document.
By default illustrator gives you some swatches, symbols, artboards, layers, etc. Some times you don't need them because your art is basic ( i.e: a plain icon). Then it becomes a waste of space in your hard drive. Maybe for one single file it could not be significant, but if you have hundred, or million of files in your hard drive, it could be a great deal for saving some space. Or maybe think you don't want to be persuaded for use the default color swatches, it also can be helpful for you to be more original.
This script gives you a graphical interface to select what do you want to delete from your document.

![ezgif-5-c82054a81a](https://user-images.githubusercontent.com/30961691/195481558-1872f5d6-3fcd-4f87-83d3-a1617bf205a6.gif)
