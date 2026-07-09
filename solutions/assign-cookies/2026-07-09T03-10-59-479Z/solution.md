```java
class Solution {
    public int findContentChildren(int[] g, int[] s) {
        Arrays.sort(g);
        Arrays.sort(s);

        int enfant = 0;
        int cookie = 0;

        while (enfant < g.length && cookie < s.length) {
            if (s[cookie] >= g[enfant]) {
                enfant++;
            }

            cookie++;
        }

        return enfant;
    }
}
```
