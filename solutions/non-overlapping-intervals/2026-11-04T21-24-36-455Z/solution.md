```java
class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a,b)->Integer.compare(a[1], b[1]));

        int count = 0;
        int start = 0;
        int end = 0;

        for (int i=1; i < intervals.length; i++) {
            start = intervals[i][0];
            end = intervals[i-1][1];

            if (start < end) {
                count++;
                
            }
        }

        return count;
    }
}
```
