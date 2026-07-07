```java
class Solution {
    public int numRescueBoats(int[] people, int limit) {
        Arrays.sort(people);

        int a_pointer = 0;
        int b_pointer = people.length - 1;

        int numberBoats = 0;

        while (a_pointer <= b_pointer) {
            if (limit == people[b_pointer]) {
                b_pointer--;
                numberBoats++;
            } else {
                int duo = people[a_pointer] + people[b_pointer];

                if (duo == limit) {
                    a_pointer++;
                    b_pointer--;
                    numberBoats++; // 1
                } else if (duo < limit) {
                    b_pointer--;
                    a_pointer++;
                    numberBoats++;
                } else {
                    a_pointer++;
                    numberBoats++;
                }
            }
        }

        return numberBoats;
    }
}
```
