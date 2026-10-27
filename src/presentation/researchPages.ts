/** At most four columns by two option rows; paging preserves readable button sizes. */
export const researchPageSize=8;
export function researchPage<T>(options:readonly T[],page:number){
 const pages=Math.max(1,Math.ceil(options.length/researchPageSize));
 const current=Math.max(0,Math.min(pages-1,page));
 return {current,pages,options:options.slice(current*researchPageSize,(current+1)*researchPageSize)};
}
