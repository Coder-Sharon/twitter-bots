import os
import sys
import numpy as np
from scipy import misc

# But start with a simple model first for proof of concept  --> what will be predicted output, and how to store dataset.

# refactor
# less than or equal to instead (what about errors for exact situations)
# should each stage happen on previous stage or on original image?
# no, since we want to see the chunked phases, by the end we don't want an avg of everything?
# would it make it quicker to do it based on chunked phases?! so we don't have to go through each pixel??
# should the final arrays be the entire pixel array again....or just array of the chunks, with the first being 1 px chunks and the last being one large chunk?
# LOOK UP + THINK ABOUT IMAGE SEGMENTATION FIRST?! --> Think about the process of painting. (paint bg than foreground?)
# we need to save each array in an array of each phase for the dataset
# make blank canvas at end! (should canvase be of only one size?)
# look up image segmentation as option instead of pixel grouping
# write tests?
# figure out how to optimize (map, reduce, etc)
# combine with wikiarts/artsy api (or other art api) and produce datasets
# we might want to include tags of each image (type, etc) in order to eventually tell the bot what sort of image to generate
# filename extensions when saving? --> but eventually we won't be saving, just storing arrays
# can play around with other things too? --> predict type, other things, etc, based on pixel evolution
# add env details to git

class Image:
	def __init__(self, filename):
		#can supply image url instead to imread!!
		self.filename = filename
		self.pxls = misc.imread(filename).swapaxes(0, 1)
		self.w = len(self.pxls)
		self.h = len(self.pxls[0])
		self.phases = self.calcPhases()
		self.dataset = [];

	def getDataset(self):
		count = 0
		for phase in self.phases:
			count += 1
			self.devolve(phase)
			self.dataset.append(self.pxls)
			myPrint('finished phase ' + str(count) + ' of ' + str(len(self.phases)))
			self.saveOutput('images/output/' + os.path.splitext(os.path.basename(self.filename))[0] + '_' + str(phase) + '.jpg')
		return self.dataset
	
	def devolve(self, phase):
		blocklen = phase
		for startX in range(0, self.w, blocklen):
			for startY in range(0, self.h, blocklen):
				block = []
				for x in range(startX, startX + blocklen):
					for y in range(startY, startY + blocklen):
						if(x < self.w and y < self.h):
							block.append(self.pxls[x][y])
				rgb = getAvgRGB(block);
				for x in range(startX, startX + blocklen):
					for y in range(startY, startY + blocklen):
						if(x < self.w and y < self.h):
							self.pxls[x][y] = rgb
	
	def calcPhases(self):
		phase = 2
		phases = [phase]
		while phase < self.w and phase < self.h:
			phases.append(phase)
			phase = phase * 2
		phases.append(self.w if self.w > self.h else self.h)
		return phases
				
	def saveOutput(self, filename):
		misc.imsave(filename, self.pxls.swapaxes(0, 1))
		#print('saved ' + filename)
		
def myPrint(str):
	sys.stdout.write(str + '\n')  # same as print
	sys.stdout.flush()
	
def getAvgRGB(cell):
	return np.round(np.average(np.array(cell), axis=0));

if __name__ == '__main__':
	images = []
	for i in range(1, 3):
		images.append('images/' + str(i) + '.jpg')

	datasets = []
	for image in images:
		img = Image(image)
		#datasets.append(img.getDataset())