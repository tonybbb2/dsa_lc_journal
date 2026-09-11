```java
class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        List<List<String>> result = new ArrayList<>();
        String[] compared = Arrays.copyOf(strs, strs.length);

        for (int a = 0; a < strs.length; a++) {
            char[] chars = strs[a].toCharArray();
            Arrays.sort(chars);
            strs[a] = new String(chars);
        }

        boolean[] used = new boolean[strs.length];

        for (int i = 0; i < strs.length; i++) {

            if (used[i]) {
                continue;
            }
            
            List<String> dynamicList = new ArrayList<>();
            dynamicList.add(compared[i]);
            used[i] = true;

            for (int j = i+1; j < strs.length; j++) {

                if (!used[j] && strs[i].equals(strs[j])) {
                    dynamicList.add(compared[j]);
                    used[j] = true;
                } 
            }

            result.add(dynamicList);

        }

        return result;
    }
}
```
