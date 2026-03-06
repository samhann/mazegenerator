#include "spanningtreealgorithm.h"

SpanningtreeAlgorithm::SpanningtreeAlgorithm() {
  generator = std::mt19937(randomdevice());
}

SpanningtreeAlgorithm::SpanningtreeAlgorithm(unsigned int seed) {
  generator = std::mt19937(seed);
}
