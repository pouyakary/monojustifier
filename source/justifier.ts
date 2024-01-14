// ─── Helper Types ──────────────────────────────────────────────────────── ✣ ─

export interface IMonoJustifierConstructorOptions {
    /** Maximum number of characters per line */
    maxLineSize: number
}

// ─── Justifier ─────────────────────────────────────────────────────────── ✣ ─

export class MonoJustifier {

    // ─── Settings ────────────────────────────────────────────────────────

    /** Maximum number of characters per line */
    #maxLineSize = 40;

    /** The character used to split the chunks */
    #splitHyphen = '-';

    // ─── Constructor ─────────────────────────────────────────────────────

    constructor(maxLineSize: number) {
        this.#maxLineSize = Math.max(10, maxLineSize);
    }

    // ─── Justifier ────────────────────────────────────────────────────────

    /** Justifies a set of gives lines to a new set of lines */
    public justify(input: string[]): string[] {
        const chunksStack   = this.#extractChunksStack(input)
        const chunksOnLines = this.#putChunksToLines(chunksStack);
        const spacedChunks  = this.#insertSpaces(chunksOnLines);

        return spacedChunks;
    }

    // ─── Chunk Extractor ─────────────────────────────────────────────────

    /** Breaks lines into `chunks` */
    #extractChunksStack(lines: string[]): string[] {
        // Our final results
        const chunks = new Array<string>();

        // In previous attempts of justification we
        // might have broken a chunk  into  splits.
        // for  example  the  world 'extraordinary'
        // might have been broken into 'extr-'  and
        // 'aordinary'.   When  reconstructing  the
        // chunks, we have  to  add  them  together
        // into  their  whole. For that matter; the
        // `cachedSplittedChunk` works as a  buffer,
        // if  we find the first half (the head) we
        // put it in `cachedSplittedChunk` and  then
        // it  becomes added to anything that comes
        // after it.
        let cachedSplittedChunk = '';

        // We navigate for each line...
        for (const index in lines) {
            const line      = lines[index];
            const lineParts = line.split(/\s+/);

            // What  we do here is to navigate chunk by
            // chunk and  add  them  if  they  are  not
            // empty.  The  other  rule is for the last
            // chunk in a line, we check if that  chunk
            // is  head  of  a broken chunk and then we
            // add it to the `cachedSplittedChunk`
            for (let i = 0; i < lineParts.length; i++) {
                const chunk = lineParts[i];

                // If  last  chunk of the chunk, try to see
                // if it was broken.
                if (i === lineParts.length - 1 && chunk.endsWith(this.#splitHyphen)) {
                    cachedSplittedChunk = chunk.substring(0, chunk.length - 1);
                    continue
                }

                if (chunk != '') {
                    chunks.push(cachedSplittedChunk + chunk);
                    cachedSplittedChunk = '';
                }
            }
        }

        // One  thing that is remarkable to unders-
        // tand, is that we use the  chunks  as  an
        // stack.  at  times  we may have to take a
        // chunk and if it didn't do  the  purpose,
        // undo our action. Thus we need to work on
        // a stack and reversing the order  of  the
        // chunks  lets the top of the stack be the
        // first   chunk   that   has    not    yet
        // been justified.
        return chunks.reverse();
    }

    // ─── Chunk Splitter ──────────────────────────────────────────────────

    #splitChunkInHalf(chunk: string, availableSpace: number): [string, string] {
        // one  char for the space to be before the
        // chunk and one for the hyphen after it.
        const availableSpaceForChunk = availableSpace - 2

        // trying to at least preserve 3 characters
        // of the chunk.
        const headSize = Math.min(availableSpaceForChunk, chunk.length - 3)

        var head = chunk.substring(0, headSize);
        var tail = chunk.substring(headSize);

        return [head, tail];
    }

    // ─── Put Chunks To Lines ─────────────────────────────────────────────

    #putChunksToLines(chunksStack: string[]): string[][] {
        const lines 	    = new Array<Array<string>>()
        const bufferLength  = (): number => buffer.join(' ').length;
        let   buffer        = new Array<string>();

        // We  operate  on a stack and work as long
        // as it is dirty
        while (chunksStack.length > 0) {
            const chunk                  = chunksStack.pop()!;
            const lineSizeWithChunkAdded = bufferLength() + 1 + chunk.length;

            // This  is  a  flag  to  see  if  we  have
            // splitted a chunk
            let splittedAChunk = false

            // We  try to add the chunk to the line and
            // test if it  goes  beyond  the  limit  we
            // have set.
            if (lineSizeWithChunkAdded > this.#maxLineSize) {

                // How  much empty space is left at the end
                // of the line  (in  a  delta  to  the  max
                // line size)
                const emptySize = (
                    this.#maxLineSize
                    - lineSizeWithChunkAdded
                    + chunk.length
                );

                // Empty factor is how much space is needed
                // between the chunks to  make  the  chunks
                // exactly  the  max size. It only takes to
                // account the empty size at the end of the
                // line.  Using  it we can very much have a
                // system  that  either  easily  or  hardly
                // splits chunks.
                const emptyFactor = emptySize / buffer.length;

                const shouldSplitChunk = (
                    chunksStack.length > 3 &&
                    chunk.length >= 6 &&
                    emptySize >= 4 &&
                    // this  one  is a magic number that I have
                    // found on many great trials and errors.
                    emptyFactor > 0.75
                );

                if (shouldSplitChunk) {
                    splittedAChunk = true
                    const [head, tail] = this.#splitChunkInHalf(chunk, emptySize)
                    chunksStack.push(tail);
                    buffer.push(`${head}${this.#splitHyphen}`)
                }

                // Adding  the  results  to  the  lines and
                // resetting the buffer.
                lines.push(buffer);
                buffer = new Array<string>();
            }

            // Now we only add the chunk if we have not
            // broken it.
            if (splittedAChunk === false) {
                buffer.push(chunk);
            }
        }

        // At  the end of the job, if our buffer is
        // dirty, we add that too.
        if (buffer.length > 0) {
            lines.push(buffer);
        }

        // handling the orphan case
        let lastLine = lines[lines.length - 1];

        // We  check if the last line is orphan and
        // if so, we take the  last  chunk  of  the
        // previous  line  and  add  it to the last
        // line to make it have some company.
        if (lastLine.length == 1 && lines.length > 1) {
            const lineToTheEnd = lines[lines.length - 2];

            if (lineToTheEnd.length > 1) {
                lines[lines.length - 1] = [lineToTheEnd.pop()!, ...lastLine];
            }
        }

        return lines;
    }

    // ─── Spacer ──────────────────────────────────────────────────────────

    /** Once the chunks are ready */
    #insertSpaces(lines: string[][]) {
        const resultLines = new Array<string>();

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const chunks                  = lines[lineIndex];
            const spacesNeeded            = chunks.length - 1;
            const spaces                  = new Array<string>();
            const lineLengthWithoutSpaces = chunks.join('').length
            const emptySpaceSize          = this.#maxLineSize - lineLengthWithoutSpaces;

            // populate spaces
            for (let j = 0; j < spacesNeeded; j++) {
                spaces.push('');
            }

            // In  case  we  are  in  the last line, we
            // don't put fancy spaces on. Just  return-
            // ing the line joined is sufficient.

            if (lineIndex == lines.length - 1) {
                resultLines.push(chunks.join(' '));
                continue;
            }

            // Counters
            let insertedSpaces = 0;
            let counter        = 0;
            let result         = '';

            // This  is  basically  something  like the
            // pigeon-holes principle. The way it works
            // is  inserting  one  single space between
            // the chunks and repeat (and increment the
            // previous    spaces)    until   we   have
            // sufficient spaces added.

            while (insertedSpaces++ < emptySpaceSize) {
                spaces[counter++ % spacesNeeded] += ' ';
            }

            // This  is  also another invention of this
            // algorithm here. Our previous loop had an
            // intentional  characteristic  in which it
            // made one end of the spaces have more and
            // one  end  less. If we add spaces in that
            // order to the lines, one end will have  a
            // very tense look and one end will be full
            // of typographical rivers.  This  is  very
            // problematical  and  thus  this  solution
            // came to my head: What if we  change  the
            // order in each line? in odd lines let the
            // order be RTL and the evens LTR, this way
            // it  will  have  a  very  homogenous  and
            // diverse look.  It  will  eliminate  many
            // possible  rivers and have the lines look
            // much more even and balanced.

            for (let j = 0; j < chunks.length - 1; j++) {
                let spaceIndex = lineIndex % 2 === 0 ? j : spacesNeeded - j - 1;
                result += chunks[j] + spaces[spaceIndex];
            }

            // Since  the number of chunks are one less
            // than spaces,  we  had  to  work  on  all
            // chunks  but  the  last  one of them. Now
            // that  they  are  handled,  we  add   the
            // last one.

            result += chunks[chunks.length - 1];
            resultLines.push(result);
        }

        // And done, we have spaces all chunks.
        return resultLines;
    }
}